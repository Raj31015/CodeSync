import { Delete, DeleteIcon, Edit, EllipsisVertical, IceCream2, Trash2 } from "lucide-react";
import {formatDistanceToNow} from "date-fns"
import { useGetApp } from "@/features/apps/api/useGetApp";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { EditAppForm } from "@/features/apps/components/editAppForm";
import { useEditApp } from "@/features/apps/api/useEditApp";
import { useState } from "react";
import { useDeleteApp } from "@/features/apps/api/useDeleteApp";
import { useConfirm } from "@/hooks/useConfirm";
import { useRouter } from "next/navigation";
import { App } from "@/app/api/project/route";
type formValues={
    name:string,
    appId:string
}
type AppCardProps={
    app:App
}
export function AppCard({app}:AppCardProps){
    const router=useRouter()
    const handleOpenApp=()=>{
        router.push(`/project/${app.appId}`)
    }
    const[edit,setEdit]=useState(false)
    const deleteMutation=useDeleteApp()
       const [ConfirmDialog,confirm]=useConfirm("Are you sure","You are about to delete an app");
        const onDelete=async()=>{
            const ok=await confirm();
            if(ok){
                deleteMutation.mutate({appId:app.appId});
            }
        }
    const mutation=useEditApp()
    const handleSubmit=(values:formValues)=>{
    mutation.mutate(values,
        {onSuccess:()=>{
            setEdit(!edit)
        }}
    )

    }
    return (
        <>
        <ConfirmDialog/>
        <div className="bg-slate-300/10 w-full h-[100px] p-4 flex items-center justify-between hover:cursor-pointer"
            onDoubleClick={handleOpenApp}
        >
            <div>
                {edit?
                
                 <EditAppForm onSubmit={(values)=>{handleSubmit(values)}} defaultValues={{name:"",appId:app.appId}}/>
                
                :
                <div>
                    {app.name}
                </div>
                }

                
                <div>
                   updated {formatDistanceToNow(app.updatedAt,{addSuffix:true})}
                </div>
                <div>
                    created by {app.username}
                </div>
            </div>
                
                <div>
                    <Popover>
                        <PopoverTrigger asChild >
                                <EllipsisVertical size={24}/>
                            
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#3D3F52] text-white rounded-xl p-4 border-none w-48">
                            <div className="flex items-center px-2 py-2 rounded-md hover:bg-[#46485c] hover:text-white cursor-pointer transition-colors duration-150"
                                onClick={()=>setEdit(!edit)}
            
                            >
                                <Edit className="mr-2 " />
                                Edit App
                            </div>
                            <Separator className="bg-white my-4" />
                            <div className="flex items-center px-2 py-2 rounded-md hover:bg-red-900/40 hover:text-red-500 cursor-pointer transition-colors duration-150"
                                onClick={()=>onDelete()}
                            >
                                <Trash2 className="mr-2" />
                                Delete App
                            </div>
                            </PopoverContent>

                    </Popover>
                   
                    
                </div>
        </div>
        </>
        
    )
}