import { auth, clerkClient } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db/drizzle";
import {
  apps,
  invitations,
  joinRequests,
  notifications,
  collaborators,
  roleEnum,
  type invitationStatusEnum,
  type requestStatusEnum,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Getrole } from "@/hooks/getrole";

type InvitationStatus = (typeof invitationStatusEnum.enumValues)[number];
type RequestStatus = (typeof requestStatusEnum.enumValues)[number];
type InvitationRole = (typeof roleEnum.enumValues)[number];

// Shape returned to the Inbox page
export interface InboxInvite {
  id: string;
  fromUserId: string;
  fromName: string;
  projectId: string;
  projectName: string;
  role: InvitationRole;
  status: InvitationStatus;
  message: string | null;
  createdAt: string;
}

export interface InboxRequest {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  status: RequestStatus;
  createdAt: string;
}

export interface InboxActivityItem {
  id: string;
  message: string;
  time: string;
}

export interface InboxResponse {
  invites: InboxInvite[];
  requestsReceived: InboxRequest[];
  requestsSent: InboxRequest[];
  activity: InboxActivityItem[];
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }

  // Invitations sent TO the current user
  const rawInvites = await db
    .select({
      id: invitations.id,
      fromUserId: invitations.fromUserId,
      toUserId: invitations.toUserId,
      projectId: invitations.projectId,
      role: invitations.role,
      status: invitations.status,
      message: invitations.message,
      createdAt: invitations.createdAt,
      projectName: apps.name,
    })
    .from(invitations)
    .leftJoin(apps, eq(apps.appId, invitations.projectId))
    .where(eq(invitations.toUserId, userId))
    .orderBy(desc(invitations.createdAt));

  const fromUserIds = Array.from(
    new Set(rawInvites.map((i) => i.fromUserId))
  );

  const client = await clerkClient();
  const fromUsers =
    fromUserIds.length > 0
      ? await client.users.getUserList({ userId: fromUserIds })
      : { data: [] };

  const invites: InboxInvite[] = rawInvites.map((i) => {
    const u = fromUsers.data.find((u) => u.id === i.fromUserId);
    const name =
      u?.username ||
      `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() ||
      "Unknown";

    return {
      id: i.id,
      fromUserId: i.fromUserId,
      fromName: name,
      projectId: i.projectId,
      projectName: i.projectName ?? "Unknown project",
      role: (i.role ?? "viewer") as InvitationRole,
      status: (i.status ?? "pending") as InvitationStatus,
      message: i.message ?? null,
      createdAt: (i.createdAt ?? new Date()).toISOString(),
    };
  });

  // Join requests for projects owned by the current user (received)
  const ownedApps = await db
    .select({ appId: apps.appId })
    .from(apps)
    .where(eq(apps.userId, userId));

  const ownedAppIds = ownedApps.map((a) => a.appId);

  let requestsReceived: InboxRequest[] = [];

  if (ownedAppIds.length > 0) {
    const rawRequests = await db
      .select({
        id: joinRequests.id,
        userId: joinRequests.userId,
        projectId: joinRequests.projectId,
        status: joinRequests.status,
        createdAt: joinRequests.createdAt,
        projectName: apps.name,
      })
      .from(joinRequests)
      .leftJoin(apps, eq(apps.appId, joinRequests.projectId))
      .where(inArray(joinRequests.projectId, ownedAppIds))
      .orderBy(desc(joinRequests.createdAt));

    const requesterIds = Array.from(
      new Set(rawRequests.map((r) => r.userId))
    );

    const requesterUsers =
      requesterIds.length > 0
        ? await client.users.getUserList({ userId: requesterIds })
        : { data: [] };

    requestsReceived = rawRequests.map((r) => {
      const u = requesterUsers.data.find((u) => u.id === r.userId);
      const name =
        u?.username ||
        `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() ||
        "Unknown";

      return {
        id: r.id,
        userId: r.userId,
        userName: name,
        projectId: r.projectId,
        projectName: r.projectName ?? "Unknown project",
        status: (r.status ?? "pending") as RequestStatus,
        createdAt: (r.createdAt ?? new Date()).toISOString(),
      };
    });
  }

  // Join requests SENT by the current user
  const rawSent = await db
    .select({
      id: joinRequests.id,
      userId: joinRequests.userId,
      projectId: joinRequests.projectId,
      status: joinRequests.status,
      createdAt: joinRequests.createdAt,
      projectName: apps.name,
    })
    .from(joinRequests)
    .leftJoin(apps, eq(apps.appId, joinRequests.projectId))
    .where(eq(joinRequests.userId, userId))
    .orderBy(desc(joinRequests.createdAt));

  const requestsSent: InboxRequest[] = rawSent.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: "You",
    projectId: r.projectId,
    projectName: r.projectName ?? "Unknown project",
    status: (r.status ?? "pending") as RequestStatus,
    createdAt: (r.createdAt ?? new Date()).toISOString(),
  }));

  // Simple activity feed derived from invitations & requests
  const activity: InboxActivityItem[] = [
    ...invites.map((i) => ({
      id: `invite-${i.id}`,
      message: `${i.fromName} invited you to ${i.projectName}`,
      time: new Date(i.createdAt).toISOString(),
    })),
    ...requestsReceived.map((r) => ({
      id: `request-${r.id}`,
      message: `${r.userName} requested to join ${r.projectName}`,
      time: new Date(r.createdAt).toISOString(),
    })),
    ...requestsSent.map((r) => ({
      id: `sent-request-${r.id}`,
      message: `You requested to join ${r.projectName}`,
      time: new Date(r.createdAt).toISOString(),
    })),
  ].sort((a, b) => (a.time < b.time ? 1 : -1));

  const payload: InboxResponse = { invites, requestsReceived, requestsSent, activity };

  return new Response(JSON.stringify(payload), { status: 200 });
}

// Create a new invitation
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { toUserId, projectId, message, role } = body ?? {};

  if (!toUserId || !projectId) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  // Only owners can invite (can be extended later for admins)
  const currentRole = await Getrole(projectId, userId);
  if (currentRole !== "owner") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const invitedRole: InvitationRole = (role ?? "viewer") as InvitationRole;

  const id = createId();

  await db.insert(invitations).values({
    id,
    fromUserId: userId,
    toUserId,
    projectId,
    role: invitedRole,
    status: "pending",
    message: message ?? null,
  });

  // Notification for the invited user
  await db.insert(notifications).values({
    id: createId(),
    userId: toUserId,
    type: "invitation",
    referenceId: id,
    message: "You have a new project invitation",
  });

  return new Response(JSON.stringify({ id }), { status: 201 });
}

// Update invitation status (accept/decline)
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { invitationId, action } = body ?? {};

  if (!invitationId || !["accept", "decline"].includes(action)) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  const [invite] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.toUserId, userId)));

  if (!invite) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  const newStatus: InvitationStatus =
    action === "accept" ? "accepted" : "declined";

  if (action === "accept") {
    await db.transaction(async (tx) => {
      await tx
        .update(invitations)
        .set({ status: newStatus })
        .where(eq(invitations.id, invitationId));

      // Create membership using the invited role, if not already a collaborator
      await tx
        .insert(collaborators)
        .values({
          collabId: createId(),
          userId,
          app_id: invite.projectId,
          role: invite.role,
        })
        .onConflictDoNothing();
    });
  } else {
    await db
      .update(invitations)
      .set({ status: newStatus })
      .where(eq(invitations.id, invitationId));
  }

  return new Response(JSON.stringify({ status: newStatus }), { status: 200 });
}

