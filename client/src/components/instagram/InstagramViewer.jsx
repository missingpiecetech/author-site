import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";
import { formatPostDate, postAlt, postSrcSet } from "./media.js";

const DESKTOP = "(min-width: 64rem)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const useMediaQuery = (query) =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
  );

const CONTROL =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ground/75 text-cream transition-colors hover:text-accent-hover disabled:cursor-default disabled:opacity-40";

/** One image or video, contained in a box already at its aspect. */
const Media = ({ item, alt, isReducedMotion }) => {
  const { large } = item.sizes;
  if (item.mediaType === "VIDEO") {
    return (
      <video
        data-testid="instagram-video"
        src={item.mediaUrl}
        poster={large.mediaUrl}
        width={large.width}
        height={large.height}
        controls
        playsInline
        muted
        loop
        autoPlay={!isReducedMotion}
        className="h-full w-full bg-ground object-contain"
      />
    );
  }
  return (
    <img
      src={large.mediaUrl}
      srcSet={postSrcSet(item.sizes)}
      sizes="(min-width: 64rem) 60vw, 100vw"
      width={large.width}
      height={large.height}
      alt={alt}
      className="h-full w-full object-contain"
    />
  );
};

/** An album's children as a scroll-snap strip with previous/next and a count. */
const Album = ({ post, isReducedMotion }) => {
  const stripRef = useRef(null);
  const [index, setIndex] = useState(0);
  const total = post.children.length;

  const handleScroll = () => {
    const strip = stripRef.current;
    setIndex(Math.round(strip.scrollLeft / strip.clientWidth));
  };

  const handleStep = (delta) => {
    const strip = stripRef.current;
    strip.scrollTo({
      left: (index + delta) * strip.clientWidth,
      behavior: isReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={stripRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        {post.children.map((child, childIndex) => (
          <div
            key={child.id}
            data-testid="instagram-album-slide"
            aria-label={`${childIndex + 1} of ${total}`}
            className="h-full w-full shrink-0 snap-center"
          >
            <Media
              item={child}
              alt={`${postAlt(post)} (${childIndex + 1} of ${total})`}
              isReducedMotion={isReducedMotion}
            />
          </div>
        ))}
      </div>
      <p
        data-testid="instagram-album-count"
        aria-live="polite"
        className="absolute top-3 left-3 rounded-full bg-ground/75 px-3 py-1 text-sm text-cream"
      >
        {index + 1} / {total}
      </p>
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => handleStep(-1)}
        disabled={index === 0}
        className={`${CONTROL} absolute top-1/2 left-3 -translate-y-1/2`}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        data-testid="instagram-album-next"
        onClick={() => handleStep(1)}
        disabled={index === total - 1}
        className={`${CONTROL} absolute top-1/2 right-3 -translate-y-1/2`}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

/**
 * The open post. Phones and tablets: full screen, media centered on the ground,
 * the date, a two-line caption (a button that expands it in place) and the
 * Instagram link over a gradient at the foot. From lg: the media beside a
 * panel with the date, the full caption and the link.
 */
const ViewerContent = ({ post, onRequestClose }) => {
  const isDesktop = useMediaQuery(DESKTOP);
  const isReducedMotion = useMediaQuery(REDUCED_MOTION);
  const [isExpanded, setIsExpanded] = useState(false);
  const { large } = post.sizes;
  const caption = post.caption.trim();

  return (
    <div className="relative flex h-full w-full flex-col lg:flex-row">
      <div className="absolute inset-0 flex items-center justify-center lg:static">
        <div
          style={{ "--ar": large.width / large.height }}
          className="aspect-(--ar) w-[min(100vw,calc(100dvh*var(--ar)))] lg:w-[min(calc(100vw-30rem),calc(85vh*var(--ar)))]"
        >
          {post.mediaType === "CAROUSEL_ALBUM" && post.children?.length ? (
            <Album post={post} isReducedMotion={isReducedMotion} />
          ) : (
            <Media
              item={post}
              alt={postAlt(post)}
              isReducedMotion={isReducedMotion}
            />
          )}
        </div>
      </div>

      {/* Collapsed, a gradient keeps the two caption lines legible over the
          media; expanded, the full text gets a near-solid panel, since a
          gradient leaves its upper lines on the bright media. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:pointer-events-auto lg:relative lg:inset-auto lg:w-96 lg:shrink-0 lg:bg-none lg:p-0 ${
          isExpanded
            ? "bg-ground/95 pt-5"
            : "bg-linear-to-t from-ground via-ground/85 to-transparent pt-16"
        }`}
      >
        <div className="pointer-events-auto flex flex-col items-start gap-3 lg:absolute lg:inset-0 lg:gap-5 lg:p-8 lg:pt-16">
          <time
            dateTime={post.timestamp}
            className="text-sm tracking-eyebrow text-subtle uppercase"
          >
            {formatPostDate(post.timestamp)}
          </time>
          {caption &&
            (isDesktop ? (
              <p
                data-testid="instagram-caption"
                className="min-h-0 flex-1 overflow-y-auto pr-2 whitespace-pre-line text-muted"
              >
                {caption}
              </p>
            ) : (
              <button
                type="button"
                data-testid="instagram-caption"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((value) => !value)}
                className={`w-full cursor-pointer text-left text-[0.9375rem] leading-relaxed whitespace-pre-line text-cream ${
                  isExpanded ? "max-h-[60vh] overflow-y-auto" : "line-clamp-2"
                }`}
              >
                {caption}
              </button>
            ))}
          <Button
            href={post.permalink}
            variant="secondary"
            size="sm"
            data-testid="instagram-link"
            className="shrink-0"
          >
            View on Instagram
          </Button>
        </div>
      </div>

      <button
        type="button"
        data-testid="instagram-close"
        aria-label="Close"
        onClick={onRequestClose}
        className={`${CONTROL} absolute top-3 right-3 text-lg`}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
};

/**
 * Modal viewer for one Instagram post. `showModal` traps focus; Escape, the
 * close button and a click on the backdrop close it, and `onClose` runs after
 * (the caller returns focus to the tile).
 */
const InstagramViewer = ({ post, onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (post && !dialog.open) dialog.showModal();
    if (!post && dialog.open) dialog.close();
  }, [post]);

  const handleRequestClose = () => dialogRef.current.close();

  return (
    <dialog
      ref={dialogRef}
      data-testid="instagram-viewer"
      aria-label="Instagram post"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) handleRequestClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-ground p-0 text-cream backdrop:bg-ground/90 lg:m-auto lg:h-fit lg:max-h-[92vh] lg:w-fit lg:max-w-[calc(100vw-4rem)] lg:bg-well"
    >
      {post && (
        <ViewerContent
          key={post.id}
          post={post}
          onRequestClose={handleRequestClose}
        />
      )}
    </dialog>
  );
};

export default InstagramViewer;
