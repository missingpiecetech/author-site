import Socials from "../components/Socials";
import Section from "../components/ui/Section";
import Eyebrow from "../components/ui/Eyebrow";
import Button from "../components/ui/Button";
import FramedImage from "../components/ui/FramedImage";
import PullQuote from "../components/ui/PullQuote";
import SITE_INFO from "../SITE_INFO";
import authorPic from "../assets/author-pic.jpeg";

const STATS = [
  { label: "Location", value: SITE_INFO.location },
  { label: "Focus", value: "Nobledark Fantasy" },
];

const AboutPage = () => {
  return (
    <>
      {/* Hero: framed portrait beside the bio */}
      <Section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute top-16 left-[6%] h-24 w-24 rounded-full bg-accent/10"></div>
          <div className="absolute top-1/3 right-[5%] h-32 w-32 rounded-full bg-accent/6"></div>
          <div className="absolute bottom-10 left-1/4 h-28 w-28 rounded-full bg-accent/8"></div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-24">
          <div className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <FramedImage
              src={authorPic}
              alt="Michael Vadney"
              aspect="portrait"
              loading="eager"
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="flex flex-col gap-4">
              <h1 className="text-title text-cream">
                About <span className="text-accent">Michael</span>
              </h1>
              <p className="font-display text-hook italic font-medium text-cream">
                Author & Podcaster
              </p>
            </div>

            <h2 className="pt-4 text-3xl font-semibold text-cream lg:text-4xl">
              The Journey Continues
            </h2>
            <div className="flex flex-col gap-4 text-lede text-muted">
              <p>
                <strong className="font-medium text-cream">
                  Michael Vadney
                </strong>{" "}
                was born in the Florida Keys, raised in the woods of
                Pennsylvania, and currently resides somewhere between the real
                world and the fantastic realms in his head.
              </p>
              <p>
                In his early-thirties, he rekindled his childhood dream of
                becoming an author. Balancing a full-time career in software
                with an unshakable need to write, Michael dedicated nights,
                weekends, and an unreasonable number of pre-dawn hours to
                storytelling. The result was{" "}
                <strong className="font-medium text-cream">Crownfall</strong>,
                his debut novel and proof that sleep is, in fact, optional.
              </p>
              <p>
                His writing lives in the nobledark corner of fantasy, where
                grim, morally complex worlds meet heroic virtues. He believes
                every story worth telling explores the space between who we are
                and who we could become.
              </p>
              <p>
                When he's not writing, podcasting, or reading... well, no,
                actually, it's almost always one of those three.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Quick Stats */}
      <Section band spacing="compact">
        <dl className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-2.5">
              <Eyebrow as="dt">{label}</Eyebrow>
              <dd className="font-display text-3xl font-semibold text-cream lg:text-[2rem]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Social Media Section */}
      <Section>
        <Socials />
      </Section>

      {/* Writing Philosophy */}
      <Section band innerClassName="flex flex-col items-center gap-8">
        <h2 className="text-center text-heading text-cream">
          Writing <span className="text-accent">Philosophy</span>
        </h2>
        <PullQuote quote="Every story worth telling explores the space between who we are and who we could become. In writing, we get to ask the biggest questions about power, justice, and survival, and maybe find some answers along the way." />
      </Section>

      {/* Invite Michael */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-24">
          <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-6">
            <Eyebrow>Press &amp; events</Eyebrow>
            <h2 className="text-heading text-cream">Invite Michael</h2>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-7">
            <p className="text-lede text-muted">
              Available for signings, conventions, panels, and podcast
              interviews.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Button to="/contact">Get in touch</Button>
              <Button variant="secondary" href={SITE_INFO.pressKit}>
                Press kit
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/*
        Instagram feed slot (plan step 4, separate branch).
        <InstagramFeed /> goes here once it exists. It renders nothing when
        there are no posts, so this slot stays empty until then.
      */}
    </>
  );
};

export default AboutPage;
