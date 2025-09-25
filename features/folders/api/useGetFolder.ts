import {useQuery} from "@tanstack/react-query"

export const useGetFolder=(folderId:string)=>{
    const query=useQuery({
        queryKey:["folder",folderId],
        queryFn:async()=>{
            const response = await fetch(`/api/folders/${folderId}`, {
                        method: 'GET',
                     });

            if(!response.ok){
                throw new Error("Error")
            }
            const data=await response.json()
            
            return data
        },
        enabled:!!folderId
    })
    return query
}