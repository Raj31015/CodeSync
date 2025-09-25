import { db } from "@/db/drizzle";
import { collaborators } from "@/db/schema";
import {eq,and} from "drizzle-orm"
export const Getrole=async (appId:string,userId:string)=>{
 const result = await db
  .select({ role: collaborators.role })
  .from(collaborators)
  .where(
    and(
      eq(collaborators.userId, userId),
      eq(collaborators.app_id, appId)
    )
  );
  return result[0]?.role 
 }