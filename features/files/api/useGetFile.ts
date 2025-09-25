import {useQuery} from "@tanstack/react-query"

export const useGetFile=(fileId:string)=>{
    const query=useQuery({
        queryKey:["file",fileId],
        queryFn:async()=>{
            const response = await fetch(`/api/files/${fileId}`, {
                        method: 'GET',
                     });

            if(!response.ok){
                throw new Error("Error")
            }
            const data=await response.json()
            console.log(data)
            
                if (!data.file) throw new Error("File not found");

                return data.file; // ✅ return the actual file object

        },
        
        enabled:!!fileId
    })
    return query
}