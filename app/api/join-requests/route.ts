import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db/drizzle";
import {
  apps,
  collaborators,
  joinRequests,
  notifications,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Getrole } from "@/hooks/getrole";

// Create a new join request for a project
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { projectId } = body ?? {};

  if (!projectId) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  // Prevent duplicate active requests
  const existing = await db
    .select()
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.userId, userId),
        eq(joinRequests.projectId, projectId)
      )
    );

  if (existing.length) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const id = createId();

  await db.insert(joinRequests).values({
    id,
    userId,
    projectId,
    status: "pending",
  });

  // Notify the project owner
  const [app] = await db
    .select({ ownerId: apps.userId })
    .from(apps)
    .where(eq(apps.appId, projectId));

  if (app?.ownerId) {
    await db.insert(notifications).values({
      id: createId(),
      userId: app.ownerId,
      type: "join_request",
      referenceId: id,
      message: "New request to join your project",
    });
  }

  return new Response(JSON.stringify({ id }), { status: 201 });
}

// Approve/decline a join request
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { requestId, action } = body ?? {};

  if (!requestId || !["accept", "decline"].includes(action)) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  const [request] = await db
    .select()
    .from(joinRequests)
    .where(eq(joinRequests.id, requestId));

  if (!request) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  // Only owners can respond
  const role = await Getrole(request.projectId, userId);
  if (role !== "owner") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  await db
    .update(joinRequests)
    .set({ status: newStatus })
    .where(eq(joinRequests.id, requestId));

  if (newStatus === "accepted") {
    // Add as collaborator with viewer role by default
    const existingCollab = await db
      .select()
      .from(collaborators)
      .where(
        and(
          eq(collaborators.userId, request.userId),
          eq(collaborators.app_id, request.projectId)
        )
      );

    if (!existingCollab.length) {
      await db.insert(collaborators).values({
        collabId: createId(),
        userId: request.userId,
        app_id: request.projectId,
        role: "viewer",
      });
    }
  }

  // Notify the requester
  await db.insert(notifications).values({
    id: createId(),
    userId: request.userId,
    type: "join_request_update",
    referenceId: request.id,
    message:
      newStatus === "accepted"
        ? "Your join request was accepted"
        : "Your join request was declined",
  });

  return new Response(JSON.stringify({ status: newStatus }), {
    status: 200,
  });
}

