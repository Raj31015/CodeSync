import { useInboxBase } from "@/features/invitations/api/useInboxBase";

export const useRequestsReceived = () => {
  const query = useInboxBase();

  return {
    ...query,
    data: query.data?.requestsReceived ?? [],
  };
};