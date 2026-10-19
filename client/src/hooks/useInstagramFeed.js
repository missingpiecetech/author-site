import { useQuery } from "@tanstack/react-query";

const fetchInstagramFeed = async () => {
  const response = await fetch("/api/instagram");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Instagram feed failed (${response.status})`);
  }
  return response.json();
};

/**
 * Michael's Instagram posts from /api/instagram (Behold, cached at the edge).
 * No retries: a failed feed is not cached, so every retry would spend one of
 * Behold's monthly requests. Callers render nothing on error.
 */
const useInstagramFeed = () =>
  useQuery({
    queryKey: ["instagram-feed"],
    queryFn: fetchInstagramFeed,
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

export default useInstagramFeed;
