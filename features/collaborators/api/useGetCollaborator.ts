import { useQuery } from "@tanstack/react-query";

export const useGetCollaborators = (appIds?: string[]) => {
  return useQuery({
    queryKey: ["collaborators", appIds],
    queryFn: async () => {
      if (!appIds?.length) return [];
      const res = await fetch("/api/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIds }),
      });
      if (!res.ok) throw new Error("Failed to fetch collaborators");
      return res.json();
    },
    enabled: !!appIds?.length,
  });
};
