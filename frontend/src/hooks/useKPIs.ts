import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useKPIs() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.getKPIs(),
    refetchInterval: 30000,
  });
}
