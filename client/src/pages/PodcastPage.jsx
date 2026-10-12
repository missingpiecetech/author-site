import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import authorAdjacentLogo from "../assets/logo_no_text.png";
import PageIntro from "../components/ui/PageIntro";
import Section from "../components/ui/Section";
import FramedImage from "../components/ui/FramedImage";
import { FiligreeCorners } from "../components/ui/Filigree";
import { FRAME_BORDER } from "../components/ui/filigree/index.js";

const TILE = `group relative flex h-full flex-col items-center gap-2 ${FRAME_BORDER} border-edge bg-well p-6 text-center no-underline transition-colors hover:border-accent`;

const TileBody = ({ icon, title, detail }) => (
  <>
    <FontAwesomeIcon
      icon={icon}
      className="mb-1 text-3xl text-accent transition-colors group-hover:text-accent-hover"
    />
    <span className="font-display text-2xl font-semibold text-cream">
      {title}
    </span>
    <span className="text-sm text-subtle">{detail}</span>
    <FiligreeCorners size="sm" />
  </>
);

const LINK = "text-accent underline hover:text-accent-hover";

const PodcastPage = () => {
  return (
    <>
      <PageIntro
        title="Author"
        accent="Adjacent"
        lede="A show about the journey from hobbyist writer to professional author"
        align="center"
      />

      {/* About the podcast */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-24">
          <div className="mx-auto w-full max-w-sm lg:col-span-2 lg:max-w-none">
            <FramedImage
              src={authorAdjacentLogo}
              alt="Author Adjacent Podcast Cover"
              aspect="square"
              imgClassName="bg-cream object-contain p-6 lg:p-10"
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <h2 className="text-heading text-cream">About the Podcast</h2>
            <div className="flex flex-col gap-5 text-lede text-muted">
              <p>
                <strong className="font-medium text-cream">
                  Author Adjacent
                </strong>{" "}
                is a weekly podcast hosted by Michael Vadney, chronicling the
                journey from hobbyist writer to published author. Through author
                interviews, bite sized writing craft lessons, book reviews and
                more, each episode delves into the realities of writing,
                publishing, and the ups and downs of pursuing a dream in the
                literary world.
              </p>
              <p>
                Whether you're an aspiring author, a seasoned writer, or just
                curious about the behind-the-scenes of book creation, this
                podcast offers honest insights, practical advice, and a dose of
                inspiration for anyone looking to make their mark in the world
                of fiction.
              </p>
              <p>
                Full episodes are available as audio on{" "}
                <a
                  href="https://open.spotify.com/show/1PLTufzD1727pDp6xCR97h"
                  className={LINK}
                >
                  Spotify
                </a>{" "}
                or video on{" "}
                <a
                  href="https://www.youtube.com/@AuthorAdjacent"
                  className={LINK}
                >
                  YouTube
                </a>
                .
              </p>
              <p>
                New episodes are released every Friday. Tune in and join the
                journey!
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Social Media & Connect */}
      <Section band>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-heading text-cream">
              Connect with Author Adjacent
            </h2>
            <p className="max-w-2xl text-lede text-muted">
              Join the community of aspiring authors and follow along with the
              writing journey.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <a
                href="https://x.com/AuthorAdjacent"
                target="_blank"
                rel="noopener noreferrer"
                className={TILE}
              >
                <TileBody
                  icon={faXTwitter}
                  title="Follow on X"
                  detail="@AuthorAdjacent"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@AuthorAdjacent"
                target="_blank"
                rel="noopener noreferrer"
                className={TILE}
              >
                <TileBody
                  icon={faYoutube}
                  title="Subscribe on YouTube"
                  detail="@AuthorAdjacent"
                />
              </a>
            </li>
            <li>
              <Link to="/contact" className={TILE}>
                <TileBody
                  icon={faMicrophone}
                  title="Suggest Topics"
                  detail="Contact Us"
                />
              </Link>
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
};

export default PodcastPage;
