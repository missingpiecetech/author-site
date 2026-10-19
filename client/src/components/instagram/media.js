/** "October 3, 2026" from an ISO timestamp. */
export const formatPostDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/** Alt text: the caption's first non-empty line. */
export const postAlt = (post) =>
  (post.prunedCaption || post.caption || "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) || "Instagram post";

/** srcset from Behold's small/medium/large sizes. */
export const postSrcSet = (sizes) =>
  ["small", "medium", "large"]
    .map((name) => `${sizes[name].mediaUrl} ${sizes[name].width}w`)
    .join(", ");
