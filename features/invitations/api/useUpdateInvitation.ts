import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateInvitationPayload {
  invitationId: string;
  action: "accept" | "decline";
}

export const useUpdateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, action }: UpdateInvitationPayload) => {
      const res = await fetch("/api/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action }),
      });
      if (!res.ok) {
        throw new Error("Failed to update invitation");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

