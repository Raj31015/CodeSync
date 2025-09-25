'use client'
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import { AppCard } from "@/components/AppCard";
import { AppForm } from "@/features/apps/components/appForm";
import { useCreateApp } from "@/features/apps/api/useCreateApp";
import { useGetApps } from "@/features/apps/api/useGetApps";
import { UserButton } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import HomeSidebar from "@/components/homeSidebar";
//todo enhance recent app card show update by some at some
export default function Home() {
  type formvalues={
    name:string
  }
  type AppProps={
    name:string,
    date:Date,
    appId:string
}

  const Appsquery=useGetApps()
  const apps=Appsquery.data
  const mutation=useCreateApp()
  const {user}=useUser()
  const username=user?.firstName
  const handleSubmit=(values:formvalues)=>{
    mutation.mutate(values.name)
  }
  if(Appsquery.isLoading){
    return(
      <p>
        loading
      </p>
    )
  }
  console.log(apps)
  return (
    <>
   
     <Header/>
     <div className="flex">
        <HomeSidebar/>
       <Separator orientation="vertical" className="bg-gray-300/40"/>
      <div className="h-screen w-screen flex flex-col">
      
      <div>
        <h1 className="text-6xl m-6">Welcome back,{username}</h1>
        <h1 className="text-4xl mx-8">Create a new App</h1>
        <div className="grid grid-cols-2 mx-8 gap-4">
         
          <AppForm onSubmit={(values)=>{handleSubmit(values)}} defaultValues={{name:""}}/>
        </div>
      
       <h1 className="text-4xl m-6">Recent Apps</h1>
        <div className=" flex flex-col w-full lg:flex-row gap-4 px-4">
           {apps.map((app:AppProps)=>{
            return(
              <AppCard key={app.appId} name={app.name} date={new Date(app.date)} appId={app.appId} />
            )
            })
          }    
          
      
        </div>
      
        
      </div>
      
    </div>
     </div>
    
    
  </>
  );
}
