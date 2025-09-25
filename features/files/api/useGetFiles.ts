import {useQuery} from "@tanstack/react-query"

export const useGetFiles=(appId:string)=>{
    const query=useQuery({
        queryKey:["files",appId],
        queryFn:async()=>{
            const response=await fetch(`/api/files?appId=${appId}`)
            if(!response.ok){
                throw new Error("Error")
            }
            const {data}=await response.json()
            
            return data
        }
        
    })
    return query
}