import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faPlay } from "@fortawesome/free-solid-svg-icons";
import Section from "../ui/Section";
import Eyebrow from "../ui/Eyebrow";
import Button from "../ui/Button";
import InstagramViewer from "./InstagramViewer";
import useInstagramFeed from "../../hooks/useInstagramFeed";
import { postAlt, postSrcSet } from "./media.js";

const BADGES = {
  VIDEO: { icon: faPlay, label: "Video" },
  CAROUSEL_ALBUM: { icon: faClone, label: "Several photos" },
};

/**
 * Home's Instagram section: Michael's latest posts (from /api/instagram) as a
 * masonry of image-only tiles at each post's own shape, two columns on phones
 * and three from lg. A tile opens the post in `InstagramViewer`. Renders
 * nothing while loading, on error or with no posts.
 */
const InstagramFeed = () => {
  const { data } = useInstagramFeed();
  const [openIndex, setOpenIndex] = useState(null);
  const tileRefs = useRef([]);

  const posts = data?.posts ?? [];
  if (!posts.length) return null;

  const handleClose = () => {
    tileRefs.current[openIndex]?.focus();
    setOpenIndex(null);
  };

  return (
    <Section data-testid="instagram-feed">
      <div className="mb-9 flex flex-col items-center gap-3 text-center lg:mb-12">
        <Eyebrow>Latest Updates</Eyebrow>
        <h2 className="text-heading text-cream">
          Follow <span className="text-accent">Along</span>
        </h2>
      </div>

      <div className="mx-auto w-4/5 columns-2 gap-3 lg:columns-3 lg:gap-4.5">
        {posts.map((post, index) => {
          const { medium } = post.sizes;
          const badge = BADGES[post.mediaType];
          return (
            <button
              key={post.id}
              ref={(node) => {
                tileRefs.current[index] = node;
              }}
              type="button"
              data-testid="instagram-tile"
              onClick={() => setOpenIndex(index)}
              className="relative mb-3 block w-full cursor-pointer break-inside-avoid bg-surface transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:mb-4.5"
            >
              <img
                src={medium.mediaUrl}
                srcSet={postSrcSet(post.sizes)}
                sizes="(min-width: 80rem) 320px, (min-width: 64rem) 24vw, 40vw"
                width={medium.width}
                height={medium.height}
                alt={postAlt(post)}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
              {badge && (
                <span className="absolute top-2.5 right-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-ground/70 text-[0.8125rem] text-cream">
                  <FontAwesomeIcon icon={badge.icon} aria-hidden="true" />
                  <span className="sr-only">{badge.label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center lg:mt-9">
        <Button href={`https://www.instagram.com/${data.username}/`}>
          Follow @{data.username}
        </Button>
      </div>

      <InstagramViewer
        post={openIndex === null ? null : posts[openIndex]}
        onClose={handleClose}
      />
    </Section>
  );
};

export default InstagramFeed;
