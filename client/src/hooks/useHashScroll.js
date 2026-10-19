import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the element named by `location.hash` once the page has rendered,
 * and once more after the next paint in case layout shifted (images, fonts).
 * Does nothing when there is no hash or no matching element. The header
 * offset comes from `scroll-padding-top` on <html>.
 */
const useHashScroll = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const scroll = () => document.getElementById(id)?.scrollIntoView();

    scroll();
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(scroll);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [pathname, hash]);
};

export default useHashScroll;
