import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import type { App } from "@/app/api/project/route"; // `App` from `apps.$inferSelect`

export const useCreateApp = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<App, Error, string>({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.name?.[0] ?? 'Failed to create app');
      }

      const { data }: { data: App } = await res.json(); // type the response
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast({ type: 'success', title: 'App created' });
    },
    onError: (err: any) => {
      toast({ type: 'error', title: 'Create failed', description: err.message });
    },
  });
};
