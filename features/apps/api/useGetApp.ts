import {useQuery} from "@tanstack/react-query"

export const useGetApp=(appId:string)=>{
    const query=useQuery({
        queryKey:["app",appId],
        queryFn:async()=>{
            const response = await fetch(`/api/project/${appId}`, {
                        method: 'GET',
                     });

            if(!response.ok){
                throw new Error("Error")
            }
            const data=await response.json()
            
            return data
        },
        enabled:!!appId
    })
    return query
}