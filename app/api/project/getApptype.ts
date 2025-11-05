'use server'
import {auth} from "@clerk/nextjs/server"
import { db } from "@/db/drizzle";
import {apps, collaborators} from "@/db/schema"
import { and,eq } from "drizzle-orm";

const getapptype=async()=>{
    const {userId}=await auth()
    if(!userId){
        throw new Error("user not found");
    }
     const ownApps = await db
    .select({
      name: apps.name,
      createdAt:apps.createdAt,
      updatedAt:apps.updatedAt,
      updatedBy:apps.updatedBy,
      appId:apps.appId
    })
    .from(apps)
    .innerJoin(
      collaborators,
      and(
        eq(collaborators.app_id, apps.appId),
        eq(collaborators.userId, userId),
        eq(collaborators.role, "owner")
      )
    );
    
  return ownApps
}
export default getapptype