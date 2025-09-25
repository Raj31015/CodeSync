import {useQuery} from "@tanstack/react-query"

export const useGetApps=()=>{
    const query=useQuery({
        queryKey:["apps"],
        queryFn:async()=>{
            const response=await fetch("/api/project")
            if(!response.ok){
                throw new Error("Error")
            }
            const {data}=await response.json()
            
            return data
        }
        
    })
    return query
}