import {
  faXTwitter,
  faInstagram,
  faTiktok,
  faThreads,
  faBluesky,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const socialLinks = [
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
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@michael_vadney",
    icon: <FontAwesomeIcon icon={faTiktok} />,
    color: "hover:bg-pink-500",
    handle: "@michael_vadney",
  },
  {
    platform: "Bluesky",
    url: "https://bsky.app/profile/michaelvadney.bsky.social",
    icon: <FontAwesomeIcon icon={faBluesky} />,
    color: "hover:bg-sky-500",
    handle: "@michaelvadney.bsky.social",
  },
  {
    platform: "Threads",
    url: "https://www.threads.com/@michael_vadney",
    icon: <FontAwesomeIcon icon={faThreads} />,
    color: "hover:bg-yellow-500",
    handle: "@michael_vadney",
  },
];

const Socials = () => (
  <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-20">
    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
      Connect & Follow the Journey
    </h2>
    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
      Stay updated on writing progress, podcast episodes, and behind-the-scenes
      insights from the author life.
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {socialLinks.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${social.color} p-6 text-center`}
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {social.icon}
          </div>
          <div className="font-semibold text-lg mb-1">{social.platform}</div>
          <div className="text-sm opacity-75">{social.handle}</div>
        </a>
      ))}
    </div>
  </div>
);

export default Socials;
