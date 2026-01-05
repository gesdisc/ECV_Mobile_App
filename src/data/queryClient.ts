import { QueryClient } from "@tanstack/react-query";

const SYNC_TTL = 5000; // 30 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchInterval: SYNC_TTL,
      gcTime: Infinity,
      networkMode: "offlineFirst",
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false, // Only while app is visible
      retry: 1,
    },
  },
});
