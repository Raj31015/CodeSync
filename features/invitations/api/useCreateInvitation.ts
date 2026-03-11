import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateInvitationPayload {

  toUserId?: string;
  toUsername?: string;
  projectId: string;
  message?: string;
  role?: "viewer" | "editor" | "owner";
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvitationPayload) => {
      const res = await fetch("/api/invitations", {
        cache:"no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create invitation");
      }
      return res.json();
    },
    onSuccess: async () => {
      console.log("INivite success")
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"],exact: false,refetchType:"active"});
      
    },
  });
};

