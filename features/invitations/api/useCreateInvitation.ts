import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateInvitationPayload {
  toUserId: string;
  projectId: string;
  message?: string;
  role?: "viewer" | "editor" | "owner";
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toUserId, projectId, message, role }: CreateInvitationPayload) => {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, projectId, message, role }),
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

