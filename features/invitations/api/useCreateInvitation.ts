import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateInvitationPayload {
  toUserId: string;
  projectId: string;
  message?: string;
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toUserId, projectId, message }: CreateInvitationPayload) => {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, projectId, message }),
      });
      if (!res.ok) {
        throw new Error("Failed to create invitation");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

