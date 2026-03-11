import { useInboxBase } from "./useInboxBase";

export const useInvitesReceived = () => {
  const query = useInboxBase();

  return {
    ...query,
    data: query.data?.invites ?? [],
  };
};