import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/app/api/folders/route"; // `App` from `apps.$inferSelect`

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<Folder, Error, {folderId:string}>({
    mutationFn: async ({folderId}) => {
      const res = await fetch('/api/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({folderId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to delete folder');
      }

      const { data }: { data: Folder } = await res.json(); // type the response
      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['folder',data.folderId] });

      console.log("Success");
    },
  });
};
