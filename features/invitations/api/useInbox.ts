import { useQuery } from "@tanstack/react-query";
import type { InboxResponse } from "@/app/api/invitations/route";

export const useInbox = () => {
  return useQuery<InboxResponse>({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await fetch("/api/invitations");
      if (!res.ok) {
        throw new Error("Failed to load inbox");
      }
      return res.json();
    },
  });
};

