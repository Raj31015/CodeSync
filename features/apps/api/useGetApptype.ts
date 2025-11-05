
import { useQuery } from '@tanstack/react-query';
import  getappType  from '@/app/api/project/getApptype'; 

export const useAppNamesQuery = () => {
  return useQuery({
    queryKey: ['ownAppNames'],
  
    queryFn: getappType, 
   
  });
};