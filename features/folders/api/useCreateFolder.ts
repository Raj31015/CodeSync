import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/app/api/folders/route"; // `folders.$inferSelect`

export const useCreateFolder = () => {
 type schema=Omit<Folder,"folderId">
  const queryClient = useQueryClient();

  return useMutation<Folder,Error,schema>({
    mutationFn: async (data:schema) => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error?.name?.[0] ?? 'Failed to create folder');
      }

      const { data: folder }: { data: Folder } = await res.json();
      
      return folder;

    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['folder', data.folderId] });
      queryClient.invalidateQueries({ queryKey: ['folders', data.appId] });
      
    },
  });
};
