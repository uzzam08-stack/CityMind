import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useBins(ward?: string) {
  return useQuery({
    queryKey: ['bins', ward],
    queryFn: () => api.getBins(ward),
    refetchInterval: 30000,
  });
}

export function useTrucks() {
  return useQuery({
    queryKey: ['trucks'],
    queryFn: () => api.getTrucks(),
    refetchInterval: 15000,
  });
}
