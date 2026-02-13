import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { notifications } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export interface NotificationItem {
  id: string;
  message: string | null;
  type: string;
  referenceId: string | null;
  read: boolean | null;
  createdAt: string;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 10;

  const rows = await db
    .select({
      id: notifications.id,
      message: notifications.message,
      type: notifications.type,
      referenceId: notifications.referenceId,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  const data: NotificationItem[] = rows.map((n) => ({
    id: n.id,
    message: n.message,
    type: n.type,
    referenceId: n.referenceId,
    read: n.read,
    createdAt: (n.createdAt ?? new Date()).toISOString(),
  }));

  return new Response(JSON.stringify(data), { status: 200 });
}

// Mark notifications as read
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { ids } = body ?? {};

  if (!Array.isArray(ids) || !ids.length) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(inArray(notifications.id, ids as string[]), eq(notifications.userId, userId))
    );

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

