import {auth,clerkClient} from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { apps } from "@/db/schema";
import { eq,and } from "drizzle-orm";
export async function GET(req:Request,{params}:{params:Promise<{appId:string}>}){

  const  userId = (await auth()).userId;
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }
    const user=await (await clerkClient()).users.getUser(userId)
    const username=user.username

const {appId}=await params
 
  const [data]=await db.select({
    name:apps.name,
    owner:apps.userId
  }).from(apps)
  .where(and(eq(apps.appId,appId),
(eq(apps.userId,userId))))
    
   return new Response(JSON.stringify({data,username}))

} 