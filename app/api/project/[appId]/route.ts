import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { apps, collaborators } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const userId = (await auth()).userId;

  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }

  const { appId } = await params;

  const [data] = await db
    .select({
      name: apps.name,
      owner: apps.userId,
    })
    .from(apps)
    .innerJoin(
      collaborators,
      eq(collaborators.app_id, apps.appId)
    )
    .where(
      and(
        eq(apps.appId, appId),
        eq(collaborators.userId, userId)
      )
    );

  if (!data) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
    });
  }

  const user = await (await clerkClient()).users.getUser(data.owner);

  return new Response(
    JSON.stringify({
      data,
      username: user.username,
    })
  );
}