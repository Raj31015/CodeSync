import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/app/api/folders/route"; // `App` from `apps.$inferSelect`

export const useEditFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<Folder, Error, {folderId:string,name:string}>({
    mutationFn: async ({folderId,name}) => {
      const res = await fetch('/api/folders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name,folderId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to rename folder');
      }

      const { data }: { data: Folder } = await res.json(); // type the response
      return data;
    },

    onSuccess: ({folderId}) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['folder',folderId] });

      console.log("Success");
    },
  });
};
