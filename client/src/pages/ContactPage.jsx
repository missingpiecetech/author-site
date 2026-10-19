import {
  GiOldMicrophone,
  GiSuitcase,
  GiLightBulb,
  GiExtraTime,
} from "react-icons/gi";
import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import { BACKGROUNDS } from "../assets/backgrounds/index.js";
import ContactChannel from "../components/contact/ContactChannel";
import SITE_INFO from "../SITE_INFO";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section */}
      <PageIntro
        background={BACKGROUNDS.cliffs}
        title="Get in"
        accent="Touch"
        lede="Whether it's business, podcast topics, or just to say hello—I'd love to hear from you"
      />

      {/* Contact Methods */}
      <Section>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <ContactChannel
            channel="business"
            title="Business Inquiries"
            lede="Professional opportunities and collaborations"
            icon={<GiSuitcase />}
            label="Primary Email"
            email={SITE_INFO.emails.business}
            listTitle="Perfect for:"
            items={[
              "Publishing opportunities and agent inquiries",
              "Writing collaborations and partnerships",
              "Media interviews and press requests",
              "Speaking engagements and events",
              "General business and professional matters",
            ]}
          />
          <ContactChannel
            channel="podcast"
            title="Podcast Topics"
            lede="Ideas, feedback, and guest suggestions"
            icon={<GiOldMicrophone />}
            label="Author Adjacent Podcast"
            email={SITE_INFO.emails.podcast}
            listTitle="Great for:"
            items={[
              "Episode topic suggestions and ideas",
              "Guest appearance requests",
              "Writing craft discussions and Q&A",
              "Author journey stories and experiences",
              "Podcast feedback and suggestions",
            ]}
          />
        </div>
      </Section>

      {/* Response Time & Expectations */}
      <Section band spacing="compact">
        <div className="grid md:grid-cols-2">
          <div className="flex min-w-0 flex-col items-center gap-3 pb-10 text-center md:pr-12 md:pb-0">
            <GiExtraTime aria-hidden="true" className="text-3xl text-accent" />
            <h3 className="text-[1.5625rem] leading-tight text-cream">
              Response Time
            </h3>
            <p className="text-lede text-muted">
              Typical response within{" "}
              <span className="font-medium text-cream">24-48 hours</span>
            </p>
            <p className="text-base text-subtle">
              Sometimes faster, occasionally longer during busy periods
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-3 border-t border-rule pt-10 text-center md:border-t-0 md:border-l md:pt-0 md:pl-12">
            <GiLightBulb aria-hidden="true" className="text-3xl text-accent" />
            <h3 className="text-[1.5625rem] leading-tight text-cream">
              Best Practices
            </h3>
            <p className="text-lede text-muted">
              Clear subject lines and specific questions help me provide better,
              faster responses
            </p>
            <p className="text-base text-subtle">
              Don't hesitate to reach out—I appreciate every message!
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ContactPage;
