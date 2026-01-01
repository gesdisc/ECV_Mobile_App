import { QueryClient } from "@tanstack/react-query";
import { Network } from "@capacitor/network";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchInterval: 30 * 60 * 1000,
      gcTime: Infinity,
      networkMode: "offlineFirst",
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
