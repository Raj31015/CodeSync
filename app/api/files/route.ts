import { auth,currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { files ,apps,collaborators} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq ,desc,and} from "drizzle-orm";
import { insertFileSchema } from "@/db/schema";
export type File = typeof files.$inferSelect;


export async function GET(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });

  const { searchParams } = new URL(req.url);
  const appId = searchParams.get("appId");

  if (!appId) {
    return new Response(JSON.stringify({ error: "Missing appId" }), { status: 400 });
  }

  const result = await db
    .select({
      fileId: files.fileId,
      name: files.name,
      appId: files.appId,
      folderId: files.folderId,
      content: files.content,
    
      createdAt: files.createdAt,
      updatedAt: files.updatedAt,
    })
    .from(files)
    .orderBy(desc(files.updatedAt))
    .where(eq(files.appId, appId))
    ;

  return new Response(JSON.stringify({ data: result }));
}

export async function POST(req: Request) {
  const userId = (await auth()).userId;
  
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  const user=await currentUser()
  if(!user?.username){
    throw new Error("user needs to be signed in")
  }

  const schema = insertFileSchema.pick({
    name: true,
    folderId: true,
    appId: true,
    content: true,

  });

  const body = await req.json();
  const res = schema.safeParse(body);
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }

  const { name, folderId, appId, content} = res.data;
  const [data] = await db
    .insert(files)
    .values({
      fileId: createId(),
      name,
      folderId: folderId || null,
      appId,
      content
    })
    .returning();
  const updated=await db
    .update(apps)
    .set({
        updatedAt:new Date(),
        updatedBy:user.username,
    })
  return new Response(JSON.stringify({ data }));
}


export async function PATCH(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
const user=await currentUser()
  if(!user?.username){
    throw new Error("user needs to be signed in")
  }

  const schema = insertFileSchema.pick({
    fileId: true,
    name: true,
    content: true,
    
  });

  const body = await req.json();
  const res = schema.safeParse(body);
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }

  const { fileId, name, content} = res.data;
  const data = await db
    .update(files)
    .set({
      name,
      content,
      
      updatedAt: new Date(),
    })
    .where(eq(files.fileId, fileId))
    .returning();
     const updated=await db
    .update(apps)
    .set({
        updatedAt:new Date(),
        updatedBy:user.username,
    })
  return new Response(JSON.stringify({ data }));
}


export async function DELETE(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });

  const schema = insertFileSchema.pick({ fileId: true });
  const body = await req.json();
  const res = schema.safeParse(body);
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }
  const { fileId } = res.data;
  // const result = await db
  //   .select({ role: collaborators.role })
  //   .from(collaborators)
  //   .where(
  //     and(
  //       eq(collaborators.userId, userId),
  //       eq(collaborators.app_id, appId)
  //     )
  //   );
  
  // if (!result[0] || result[0].role !== "owner") {
  //   return Response.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const data = await db
    .delete(files)
    .where(eq(files.fileId, fileId))
    .returning();

  return new Response(JSON.stringify({ deleted: data.length > 0 }));
}
