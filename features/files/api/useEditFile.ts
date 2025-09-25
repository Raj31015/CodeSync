import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { File } from "@/app/api/files/route"; // `App` from `apps.$inferSelect`

export const useEditFile = () => {
  const queryClient = useQueryClient();

  return useMutation<File, Error, {fileId:string,name:string}>({
    mutationFn: async ({fileId,name}) => {
      const res = await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name,fileId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to rename File');
      }

      const { data }: { data: File } = await res.json(); // type the response
      return data;
    },

    onSuccess: ({fileId}) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['file',fileId] });

      console.log("Success");
    },
  });
};
