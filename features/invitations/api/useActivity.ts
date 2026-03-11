import { useInboxBase } from "./useInboxBase";

export const useActivity = () => {
  const query = useInboxBase();

  return {
    ...query,
    data: query.data?.activity ?? [],
  };
};