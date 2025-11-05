'use server'

import { auth ,clerkClient} from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { collaborators, apps } from "@/db/schema";
import { inArray, ne, eq, and,sql } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }


  const { appIds } = await req.json();
  if (!appIds?.length) {
    return new Response(JSON.stringify([])),{status:200};
  }


  const allCollaborators = await db
    .select({
      collaboratorId: collaborators.userId,
      appIds: sql<string[]>`array_agg(${collaborators.app_id})`.as("appIds"),
      roles: sql<string[]>`array_agg(${collaborators.role})`.as("roles"),
      appNames: sql<string[]>`array_agg(${apps.name})`.as("appNames"),
    })
    .from(collaborators)
    .leftJoin(apps, eq(apps.appId, collaborators.app_id))
    .where(
      and(
        inArray(collaborators.app_id, appIds),
        ne(collaborators.userId, userId)
      )
    )
   .groupBy(collaborators.userId);
    console.log(allCollaborators)
     if (!allCollaborators.length) {
    return new Response(JSON.stringify([]), { status: 200 });
  }
  
  
  

  
  const client = await clerkClient()
  const clerkUsers=await client.users.getUserList({
    userId: allCollaborators.map(c => c.collaboratorId),
  });

  const collaboratorsWithNames = allCollaborators.map(c => {
    const u = clerkUsers.data.find(u => u.id === c.collaboratorId);
    const apps = c.appIds.map((id: string, i: number) => ({
      id,
      name: c.appNames[i],
      role: c.roles[i],
    }));
    return {
      collabId:c.collaboratorId,
      username: u?.username || "",
      realname:`${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "",
      apps
    };
  });

  return new Response(JSON.stringify(collaboratorsWithNames), { status: 200 });
}
