import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faBluesky } from "@fortawesome/free-brands-svg-icons";

const Footer = () => (
  <footer className="bg-gray-100 border-t border-gray-200 py-12 text-gray-700">
    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="font-bold text-lg text-gray-900">Michael Vadney</span>
        <span className="text-sm">Fantasy Author & Podcaster</span>
        <span className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Michael Vadney. All rights reserved.</span>
      </div>
      <nav className="flex flex-wrap gap-6 text-sm">
        <a href="/" className="hover:text-secondary">
          Home
        </a>
        <a href="/books" className="hover:text-secondary">
          Books
        </a>
        <a href="/podcast" className="hover:text-secondary">
          Podcast
        </a>
        <a href="/about" className="hover:text-secondary">
          About
        </a>
        <a href="/contact" className="hover:text-secondary">
          Contact
        </a>
      </nav>
      <div className="flex gap-4">
        <a
          href="https://x.com/Michael_Vadney"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="hover:text-secondary text-xl">
          <FontAwesomeIcon icon={faXTwitter} />
        </a>
        <a
          href="https://bsky.app/profile/michaelvadney.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="hover:text-secondary text-xl">
          <FontAwesomeIcon icon={faBluesky} />
        </a>
        <a
          href="https://www.instagram.com/michael_vadney/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:text-secondary text-xl">
          <FontAwesomeIcon icon={faInstagram} />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
