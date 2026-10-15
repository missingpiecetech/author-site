import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoodreads } from "@fortawesome/free-brands-svg-icons";
import SOCIAL_LINKS from "../SOCIAL_LINKS";
import SITE_INFO from "../SITE_INFO";
import { BOOKS } from "../BOOK_DATA";

const GOODREADS = BOOKS.find((book) => book.slug === "crownfall")?.retailers
  ?.goodreads;

const FOOTER_LINKS = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/podcast", label: "Podcast" },
  { to: "/about", label: "About" },
  { to: "/store", label: "Store" },
  { to: "/contact", label: "Contact" },
];

const SOCIALS = [
  ...SOCIAL_LINKS,
  ...(GOODREADS
    ? [
        {
          platform: "Goodreads",
          url: GOODREADS,
          icon: <FontAwesomeIcon icon={faGoodreads} />,
        },
      ]
    : []),
];

const linkClass = "text-subtle transition-colors hover:text-accent-hover";

const Footer = () => (
  <footer className="border-t border-rule px-6 pt-8 pb-8 text-[0.9375rem] text-subtle lg:px-20 lg:pt-14 lg:pb-12">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-2.5">
        <span className="font-display text-[1.625rem] text-cream">
          {SITE_INFO.name}
        </span>
        <span>{SITE_INFO.tagline}</span>
        <span className="text-sm">
          &copy; {new Date().getFullYear()} {SITE_INFO.name}. All rights
          reserved.
        </span>
      </div>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-base">
          {FOOTER_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={linkClass}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={SITE_INFO.pressKit}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Press Kit
            </a>
          </li>
        </ul>
      </nav>
      <ul className="flex flex-wrap gap-5 text-xl">
        {SOCIALS.map((social) => (
          <li key={social.platform}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="text-accent transition-colors hover:text-accent-hover"
            >
              {social.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export default Footer;
