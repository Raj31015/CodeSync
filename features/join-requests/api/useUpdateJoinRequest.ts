import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateJoinRequestPayload {
  requestId: string;
  action: "accept" | "decline";
}

export const useUpdateJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action }: UpdateJoinRequestPayload) => {
      const res = await fetch("/api/join-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (!res.ok) {
        throw new Error("Failed to update join request");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

