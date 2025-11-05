'use client'
import React from 'react'
import {App} from "@/app/api/project/route"
import { DataTable } from './data-table'
import { Sidebar } from '@/components/ui/sidebar'
import Header from '@/components/Header'
import { useAppNamesQuery } from '@/features/apps/api/useGetApptype';
import HomeSidebar from "@/components/homeSidebar"
import { useGetApps } from '@/features/apps/api/useGetApps'
import { AppCard } from '@/components/AppCard'
import {columns} from "./columns"
import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
type Apptype={name:string}
const projectLanding = () => {
     
 const ownappsquery = useAppNamesQuery();
   const AppsQuery=useGetApps()
   const isLoading=ownappsquery.isLoading || AppsQuery.isLoading
  
 
  
  if (isLoading || !AppsQuery.data || !ownappsquery.data) return <div>Loading apps...</div>;
  const data=AppsQuery.data || []
  const ownApps=ownappsquery.data 
  
  const ownAppNames = ownApps!.map(app => app.name);
 const sharedApps = data.filter((app:Apptype) =>!ownAppNames.includes(app.name));
  console.log(ownappsquery.data)
  console.log(AppsQuery.data)
  console.log(sharedApps)
  
  
   return (
       <>
           <Header/>
           <div className="flex">
           <HomeSidebar/>
           <div className="w-screen p-4">
               <h2 className="text-5xl font-semibold block mb-6 ml-4">Apps</h2>
                {data.length === 0 && <p>No collaborators found.</p>}
                  
                 <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="all" className="w-full h-full mx-auto mt-6">
        <div className="flex flex-col items-start">

    {/* Tabs header */}
    <TabsList className="flex space-x-2 bg-transparent p-0 mb-0">
      <TabsTrigger
        value="all"
        className="rounded-t-xl px-5 py-2 text-sm font-medium border-none 
        data-[state=active]:bg-blue-600/10 data-[state=active]:text-white
        data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-300
        transition-all duration-200"
      >
        All
      </TabsTrigger>

      <TabsTrigger
        value="owned"
        className="rounded-t-xl px-5 py-2 text-sm font-medium border-none
        data-[state=active]:bg-blue-600/10 data-[state=active]:text-white
       
        data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-300
        transition-all duration-200"
      >
        Owned
      </TabsTrigger>

      <TabsTrigger
        value="shared"
        className="rounded-t-xl px-5 py-2 text-sm font-medium border-none
        data-[state=active]:bg-blue-600/20 data-[state=active]:text-white
       
        data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-300
        transition-all duration-200"
      >
        Shared
      </TabsTrigger>
    </TabsList>

    {/* Active Tab Content Container */}
    <div className="rounded-b-xl rounded-tr-xl border-none bg-blue-600/10 p-6 transition-all duration-300 w-full">
      <TabsContent value="all" className="bg-transparent text-white">
        <DataTable columns={columns} data={data} showOwnerColumn={true} />
      </TabsContent>

      <TabsContent value="owned" className="bg-transparent text-white">
        <DataTable columns={columns} data={ownApps} showOwnerColumn={false} />
      </TabsContent>

      <TabsContent value="shared" className="bg-transparent text-white">
        <DataTable columns={columns} data={sharedApps} showOwnerColumn={true} />
      </TabsContent>
    </div>

  </div>
</Tabs>

            </div>
               
               
           </div>
       
         
           </div>
        
       </>
     );
}
export default projectLanding
