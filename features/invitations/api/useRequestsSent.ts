import { useInboxBase } from "@/features/invitations/api/useInboxBase";

export const useRequestsSent = () => {
  const query = useInboxBase();

  return {
    ...query,
    data: query.data?.requestsSent ?? [],
  };
};