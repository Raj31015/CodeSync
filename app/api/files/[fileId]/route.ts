// app/api/files/[fileId]/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { files, apps } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const userId = (await auth()).userId;

  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }

  const {fileId} = await params;

  // Fetch the file and app (joined) to check ownership
  const [data] = await db
    .select({
      fileId: files.fileId,
      name: files.name,
      content: files.content, // if exists
      appId: files.appId,
      folderId: files.folderId,
      createdAt: files.createdAt,
      updatedAt: files.updatedAt,
   
    })
    .from(files)

    .where(eq(files.fileId, fileId));

  if (!data) {
    return new Response(JSON.stringify({ error: "File not found or unauthorized" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ file: data }));
}
