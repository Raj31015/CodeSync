'use client'
import Header from "@/components/Header";
import { z } from "zod";
import Sidebar from "@/components/homeSidebar";
import { useGetApps } from "@/features/apps/api/useGetApps";
import { useGetCollaborators } from "@/features/collaborators/api/useGetCollaborator";
import { App } from "../api/project/route";
import { insertCollabSchema } from "@/db/schema";
import { DataTable } from "./data-table";
import {columns,Collaboration} from "./columns"


export default function CollaboratorsList() {

  const schema=insertCollabSchema.omit({userId:true}) as unknown as z.ZodTypeAny //& {username:string;realname:string}
  type CollabSchema=z.infer<typeof schema> & {username:string,realname:string}
  const appsQuery = useGetApps();
  const appIds = appsQuery.data?.map((a:App) => a.appId);
  const collaboratorsQuery = useGetCollaborators(appIds);

  if (appsQuery.isLoading || collaboratorsQuery.isLoading) return <p>Loading...</p>;
  
  const data=collaboratorsQuery.data
  console.log(data)
  return (
    <>
        <Header/>
        <div className="flex">
        <Sidebar/>
        <div className="w-screen">
            <h2 className="text-5xl font-semibold block mb-6 ml-4">Collaborators</h2>
             {collaboratorsQuery.data?.length === 0 && <p>No collaborators found.</p>}
                <div className="container mx-auto py-10 w-[90%] shadow-sm ">
                <DataTable columns={columns} data={data} />
              </div>
             
             
        </div>
    
      
        </div>
     
    </>
  );
}
