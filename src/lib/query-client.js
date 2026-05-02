import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Stale-while-revalidate: show cached data immediately, revalidate in background
      staleTime: 2 * 60 * 1000,       // 2 min — data is "fresh" for this long
      gcTime: 10 * 60 * 1000,         // 10 min — keep in cache after unmount
    },
  },
});