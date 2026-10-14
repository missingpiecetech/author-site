import {
  faXTwitter,
  faInstagram,
  // Add these back later if desired
  // faTiktok,
  faThreads,
  faBluesky,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SOCIAL_LINKS = [
  {
    platform: "YouTube",
    network: "youtube",
    url: "https://www.youtube.com/@AuthorAdjacent",
    icon: <FontAwesomeIcon icon={faYoutube} />,
    handle: "@AuthorAdjacent",
  },
  {
    platform: "Instagram",
    network: "instagram",
    url: "https://www.instagram.com/michael_vadney/",
    icon: <FontAwesomeIcon icon={faInstagram} />,
    handle: "@michael_vadney",
  },
  {
    platform: "X",
    network: "x",
    url: "https://x.com/Michael_Vadney",
    icon: <FontAwesomeIcon icon={faXTwitter} />,
    handle: "@Michael_Vadney",
  },
  // Add these back later if desired
  // {
  //   platform: "TikTok",
  //   url: "https://www.tiktok.com/@michael_vadney",
  //   icon: <FontAwesomeIcon icon={faTiktok} />,
  //   handle: "@michael_vadney",
  // },
  {
    platform: "Bluesky",
    network: "bluesky",
    url: "https://bsky.app/profile/michaelvadney.bsky.social",
    icon: <FontAwesomeIcon icon={faBluesky} />,
    handle: "@michaelvadney.bsky.social",
  },
  {
    platform: "Threads",
    network: "threads",
    url: "https://www.threads.com/@michael_vadney",
    icon: <FontAwesomeIcon icon={faThreads} />,
    handle: "@michael_vadney",
  },
];

export default SOCIAL_LINKS;
