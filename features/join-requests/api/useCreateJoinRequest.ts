import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateJoinRequestPayload {
  projectId: string;
  role: "viewer" | "editor" | "owner";
}

export const useCreateJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, role }: CreateJoinRequestPayload) => {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, role }),
      });
      if (!res.ok) {
        throw new Error("Failed to create join request");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

