import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { App } from "@/app/api/project/route"; // `App` from `apps.$inferSelect`

export const useDeleteApp = () => {
  const queryClient = useQueryClient();

  return useMutation<App, Error, {appId:string}>({
    mutationFn: async ({appId}) => {
      const res = await fetch('/api/project', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({appId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to create app');
      }

      const { data }: { data: App } = await res.json(); // type the response
      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
            queryClient.invalidateQueries({ queryKey: ['app',data.appId] });

      console.log("Success");
    },
  });
};
