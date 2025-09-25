import {useQuery} from "@tanstack/react-query"

export const useGetFolders=(appId:string)=>{
    const query=useQuery({
        queryKey:["folders",appId],
        queryFn:async()=>{
            const response=await fetch(`/api/folders?appId=${appId}`)
            if(!response.ok){
                throw new Error("Error")
            }
           
            const {data}=await response.json()
            
            return data
        }   
    }
    
)
    return query
}