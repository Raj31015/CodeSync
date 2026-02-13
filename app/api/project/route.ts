
import {auth,currentUser,clerkClient} from "@clerk/nextjs/server";
import {createId} from "@paralleldrive/cuid2"
import { db } from "@/db/drizzle";
import { apps, collaborators } from "@/db/schema";
import { and, eq, inArray,desc } from "drizzle-orm";
import { insertAppSchema } from "@/db/schema";
import { Getrole } from "@/hooks/getrole";
export async function GET(req:Request){
  const {searchParams}=new URL(req.url)
 const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  const  userId = (await auth()).userId;
  
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }
  const Applist=await db.select({appId:collaborators.app_id})
                .from(collaborators)
                .where(eq(collaborators.userId,userId))
  const appIds = Applist.map((row) => row.appId);
 
    if (appIds.length === 0) {
    return new Response(JSON.stringify({ data: [] }));
  }

  const applist= db.select({
    name:apps.name,
    appId:apps.appId,
    userId:apps.userId,
    createdAt:apps.createdAt,
    updatedAt:apps.updatedAt,
    updatedBy:apps.updatedBy
  }).from(apps)
    .where(
          inArray(apps.appId,appIds)
        )
        .orderBy(desc(apps.updatedAt))
    if(limit){
      applist.limit(limit)
    }
  const data= await applist
  const client = await clerkClient()
    const clerkUsers=await client.users.getUserList({
    userId: data.map(c => c.userId),
  });

  const finaldata = data.map((app)=> {
    const u=clerkUsers.data.find(u => u.id === app.userId)?.username;
    return {
    ...app,
    username:u ??"unknown" 
    }
  });
    
 return new Response(JSON.stringify(finaldata))
}
export async function POST(req:Request){
  
  const  userId = (await auth()).userId;

  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }
  const user=await currentUser()
    if(!user?.username){
      throw new Error("user needs to be signed in")
    }
  
  const schema=insertAppSchema.pick({name:true})

  const body=await req.json()
 const res=schema.safeParse(body)
 if (!res.success) {
  return Response.json({ error: res.error.format() }, { status: 400 });
}
 const {name}=res.data
 const appId=createId()
  const [data]=await db.insert(apps).values({
    appId:appId,
    userId:userId,
    name:name,
    createdAt:new Date(),
    updatedAt:new Date(),
    updatedBy:user.username

    

  }).returning()
  const participants =await db.insert(collaborators).values({
    userId:userId,
    collabId:createId(),
    app_id:appId,
    role:"owner"
  })
   return new Response(JSON.stringify({data}))

}
export type App={
  appId: string
  name: string
  createdAt: string | Date
  updatedAt: string | Date
  updatedBy: string
  userId?: string
  username: string
}
export async function PATCH(req:Request){
 const  userId = (await auth()).userId;
  
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }  
   const schema=insertAppSchema.pick({name:true,appId:true})

  const body=await req.json()
 const res=schema.safeParse(body)
   if (!res.success) {
    return Response.json({ error: 'Invalid input', issues: res.error}, { status: 400 });
  }
  const {appId,name}=res.data
 const role=await Getrole(appId,userId)
if (role === "viewer") {
  return Response.json({ error: "Unauthorized" }, { status: 403 });
}

  const data=await db.update(apps)
            .set({
              name:name
            })
            .where(and(
              eq(apps.appId,appId),
              eq(apps.userId,userId)
            )).returning()
  
    return new Response(JSON.stringify({data}))

}
export async function DELETE(req:Request){
 const  userId = (await auth()).userId;
  
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }  
   const schema=insertAppSchema.pick({appId:true})

  const body=await req.json()
 const res=schema.safeParse(body)
   if (!res.success) {
    return Response.json({ error: 'Invalid input', issues: res.error}, { status: 400 });
  }
  const {appId}=res.data
 const result = await db
  .select({ role: collaborators.role })
  .from(collaborators)
  .where(
    and(
      eq(collaborators.userId, userId),
      eq(collaborators.app_id, appId)
    )
  );

if (!result[0] || result[0].role !== "owner") {
  return Response.json({ error: "Unauthorized" }, { status: 403 });
}

  const data=await db.delete(apps)
            .where(and(
              eq(apps.appId,appId),
              eq(apps.userId,userId)
            )).returning()
  const {name} =data[0];
  
    return new Response(JSON.stringify({name}))

}