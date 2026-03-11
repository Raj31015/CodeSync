import { useQuery } from "@tanstack/react-query";
import type { InboxResponse } from "@/app/api/invitations/route";

export const useInboxBase = () => {
  return useQuery<InboxResponse>({
    queryKey: ["inbox"],
    queryFn: async () => {
      console.log("Fetching inbox...");
      const res = await fetch("/api/invitations", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load inbox");
      }

      return res.json();
    },
    staleTime: 0,
  });
};