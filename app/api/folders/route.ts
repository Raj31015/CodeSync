import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { folders } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

const insertFolderSchema = createInsertSchema(folders);
export type Folder = typeof folders.$inferSelect;


export async function GET(req:Request) {
    const schema=insertFolderSchema.pick({
        appId:true
    })
  const userId = (await auth()).userId;

  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const appId = searchParams.get("appId");

  if (!appId) {
    return new Response(JSON.stringify({ error: "Missing appId" }), { status: 400 });
  }
   const res = schema.safeParse({ appId });
    
  if (!res.success) {
    return Response.json({ error: res.error}, { status: 400 });
  }

  const folderList=db.select({
    folderId:folders.folderId,
    name:folders.name,
    
    parentId:folders.parentId
  })
  .from(folders)
  .where(eq(folders.appId,appId))
  const data=await folderList
 
      return new Response(JSON.stringify({data}));

}


export async function POST(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });

  const schema = insertFolderSchema.pick({
    name: true,
    appId: true,
    parentId: true,
  });

  const body = await req.json();
  const res = schema.safeParse(body);
 
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }

  const { name, appId, parentId } = res.data;
  const [data] = await db
    .insert(folders)
    .values({
      folderId: createId(),
      name:name,
      appId:appId,
      parentId:parentId || null,
    })
    .returning();

  return new Response(JSON.stringify({ data }));
}


export async function PATCH(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });

  const schema = insertFolderSchema.pick({
    name: true,
    folderId: true,
  });

  const body = await req.json();
  const res = schema.safeParse(body);
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }

  const { name, folderId } = res.data;
  const data = await db
    .update(folders)
    .set({ name })
    .where(eq(folders.folderId, folderId))
    .returning();

  return new Response(JSON.stringify({ data }));
}


export async function DELETE(req: Request) {
  const userId = (await auth()).userId;
  if (!userId) return new Response(JSON.stringify({ authenticated: false }), { status: 401 });

  const schema = insertFolderSchema.pick({ folderId: true });
  const body = await req.json();
  const res = schema.safeParse(body);
  if (!res.success) {
    return Response.json({ error: res.error.format() }, { status: 400 });
  }

  const { folderId } = res.data;
  const data = await db
    .delete(folders)
    .where(eq(folders.folderId, folderId))
    .returning();

  return new Response(JSON.stringify({ deleted: data.length > 0 }));
}
