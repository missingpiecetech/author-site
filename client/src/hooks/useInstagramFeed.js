import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../lib/errors.js";

const fetchInstagramFeed = () => fetchJson("/api/instagram");

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
