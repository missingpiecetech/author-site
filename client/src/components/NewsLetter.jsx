import JoinCircleButton from "./JoinCircleButton";
import { FiligreeCorners } from "./ui/Filigree";

const NewsLetter = () => {
  const titles = [
    <>
      Join the <span className="text-accent">Journey</span>
    </>,
    <>
      Never Miss a <span className="text-accent">Release</span>
    </>,
    <>
      Receive <span className="text-accent">Updates</span>
    </>,
  ];
  const descriptions = [
    "Whether you're a fellow hobbyist writer or just curious about the book community, you're welcome to follow along as we navigate this journey together.",
    "Be the first to know about new book releases, exclusive excerpts, and behind-the-scenes content from the writing process.",
    "Get updates on new releases, podcast episodes, and behind-the-scenes insights from the writing journey.",
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  const description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-t border-rule px-6 py-12 lg:px-20 lg:py-26"
    >
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 border border-accent px-6 py-8 text-center lg:gap-6 lg:px-16 lg:py-14">
        <h2 id="newsletter-heading" className="text-heading text-cream">
          {title}
        </h2>
        <p className="max-w-2xl text-lede text-muted">{description}</p>
        <div className="mt-2 flex w-full max-w-md flex-col items-center gap-4">
          <JoinCircleButton
            id="subscribe-button"
            size="lg"
            block
            className="subscribe-button"
          >
            Subscribe for updates
          </JoinCircleButton>
          <p className="text-sm text-subtle">
            No spam, unsubscribe at any time. Updates only when there's real
            news to share.
          </p>
        </div>
        <FiligreeCorners />
      </div>
    </section>
  );
};

export default NewsLetter;
