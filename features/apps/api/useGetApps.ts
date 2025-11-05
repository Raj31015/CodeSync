import {useQuery} from "@tanstack/react-query"
import type { App } from "@/app/api/project/route"
export const useGetApps=(limit?:number)=>{
    const query = useQuery<App[]>({
    queryKey: ["apps", limit ?? "all"],
    queryFn: async (): Promise<App[]> => {
      const response = await fetch("/api/project")
      if (!response.ok) {
        throw new Error("Error fetching apps")
      }
      const data: App[] = await response.json()
      return data
    },
  })

    return query
}