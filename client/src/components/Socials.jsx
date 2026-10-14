import SOCIAL_LINKS from "../SOCIAL_LINKS";
import { EVENTS, track } from "../lib/analytics.js";

const Socials = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-heading text-cream">Connect & Follow the Journey</h2>
      <p className="max-w-2xl text-lede text-muted">
        Stay updated on writing progress, podcast episodes, and
        behind-the-scenes insights from the author life.
      </p>
    </div>
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SOCIAL_LINKS.map((social) => (
        <li key={social.platform}>
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track(EVENTS.SOCIAL_LINK_CLICK, {
                network: social.network,
                placement: "about",
              })
            }
            className="group flex h-full flex-col items-center gap-2 bg-well p-6 text-center"
          >
            <span className="mb-1 text-3xl text-accent transition-colors group-hover:text-accent-hover">
              {social.icon}
            </span>
            <span className="font-display text-2xl font-semibold text-cream transition-colors group-hover:text-accent-hover">
              {social.platform}
            </span>
            <span className="min-w-0 text-sm break-all text-subtle">
              {social.handle}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Socials;
