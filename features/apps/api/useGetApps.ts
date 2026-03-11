import {useQuery} from "@tanstack/react-query"
import type { App } from "@/app/api/project/route"
export const useGetApps = (limit?: number) => {
  return useQuery<App[]>({
    queryKey: ["apps", limit ?? "all"],
    queryFn: async (): Promise<App[]> => {
      const url = limit
        ? `/api/project?limit=${limit}`
        : `/api/project`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error fetching apps")
      }

      const result = await response.json()

      return Array.isArray(result) ? result : []
    },
  })
}