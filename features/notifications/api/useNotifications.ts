import { useQuery } from "@tanstack/react-query";
import type { NotificationItem } from "@/app/api/notifications/route";

export const useNotifications = (limit = 10) => {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications", limit],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}`);
      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }
      return res.json();
    },
  });
};

