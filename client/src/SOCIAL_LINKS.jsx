import {
  faXTwitter,
  faInstagram,
  // Add these back later if desired
  // faTiktok,
  // faThreads,
  // faBluesky,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SOCIAL_LINKS = [
  {
    platform: "YouTube",
    url: "https://www.youtube.com/@AuthorAdjacent",
    icon: <FontAwesomeIcon icon={faYoutube} />,
    color: "hover:bg-red-500",
    handle: "@AuthorAdjacent",
  },
  {
    platform: "X",
    url: "https://x.com/Michael_Vadney",
    icon: <FontAwesomeIcon icon={faXTwitter} />,
    color: "hover:bg-gray-500",
    handle: "@Michael_Vadney",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/michael_vadney/",
    icon: <FontAwesomeIcon icon={faInstagram} />,
    color: "hover:bg-purple-500",
    handle: "@michael_vadney",
  },
  // Add these back later if desired
  // {
  //   platform: "TikTok",
  //   url: "https://www.tiktok.com/@michael_vadney",
  //   icon: <FontAwesomeIcon icon={faTiktok} />,
  //   color: "hover:bg-pink-500",
  //   handle: "@michael_vadney",
  // },
  // {
  //   platform: "Bluesky",
  //   url: "https://bsky.app/profile/michaelvadney.bsky.social",
  //   icon: <FontAwesomeIcon icon={faBluesky} />,
  //   color: "hover:bg-sky-500",
  //   handle: "@michaelvadney.bsky.social",
  // },
  // {
  //   platform: "Threads",
  //   url: "https://www.threads.com/@michael_vadney",
  //   icon: <FontAwesomeIcon icon={faThreads} />,
  //   color: "hover:bg-yellow-500",
  //   handle: "@michael_vadney",
  // },
];

export default SOCIAL_LINKS;
