import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { App } from "@/app/api/project/route"; // `App` from `apps.$inferSelect`

export const useEditApp = () => {
  const queryClient = useQueryClient();

  return useMutation<App, Error, {appId:string,name:string}>({
    mutationFn: async ({appId,name}) => {
      const res = await fetch('/api/project', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name,appId}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to create app');
      }

      const { data }: { data: App } = await res.json(); // type the response
      return data;
    },

    onSuccess: ({appId}) => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
            queryClient.invalidateQueries({ queryKey: ['app',appId] });

      console.log("Success");
    },
  });
};
