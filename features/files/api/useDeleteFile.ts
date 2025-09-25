import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { File } from "@/app/api/files/route"; // `App` from `apps.$inferSelect`

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation<File, Error, {fileId:string}>({
    mutationFn: async ({fileId}) => {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({fileId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to delete file');
      }

      const { data }: { data: File } = await res.json(); // type the response
      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['file',data.fileId] });

      console.log("Success");
    },
  });
};
