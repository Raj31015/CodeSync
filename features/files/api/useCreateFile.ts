import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { File } from "@/app/api/files/route"; // `Files.$inferSelect`

export const useCreateFile = () => {
  type schema=Pick<File,"name"|"appId"|"folderId">
  const queryClient = useQueryClient();

  return useMutation<File, Error,schema>({
    mutationFn: async (data:schema) => {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
       
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error?.name?.[0] ?? 'Failed to create File');
      }

      const { data: File }: { data: File } = await res.json();
     
      return File;

    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['file', data.fileId] });
      queryClient.invalidateQueries({ queryKey: ['files', data.appId] });

    },
  });
};
