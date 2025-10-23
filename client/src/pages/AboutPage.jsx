import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faMapMarkerAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import NewsLetter from "../components/NewsLetter";
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mt-24 relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-25 left-15 w-24 h-24 bg-secondary/10 rounded-full"></div>
          <div className="absolute top-45 right-20 w-32 h-32 bg-secondary/5 rounded-full"></div>
          <div className="absolute bottom-25 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
        </div>
        <div className="relative w-full text-center">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight mb-6">
            About <span className="text-secondary">Michael</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Author & Podcaster
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        {/* Author Profile Section */}
        <div className="grid lg:grid-cols-5 gap-12 items-center mb-20">
          {/* Bio Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Journey Continues
              </h2>
              <div className="prose prose-lg max-w-none text-left text-gray-700 leading-relaxed text-lg space-y-4">
                <p className="">
                  <strong>Michael Vadney</strong> is an American fantasy author
                  and podcaster based in Fort Worth, Texas. Born in Key West,
                  Florida and raised in the woods of Pennsylvania, Michael's
                  love for storytelling began at an early age. His passion for
                  fantasy literature was ignited by classics like "The Hobbit"
                  and "Redwall," inspiring him to create his own worlds filled
                  with complex characters and fantastic magic.
                </p>
                <p className="">
                  Like many writers, Michael's path to writing started late. In
                  his early-thirties, he rekindled his childhood dream of
                  becoming an author. Balancing a full-time career in software,
                  he dedicated nights, weekends, and many dawns to writing,
                  learning the craft through trial and error, online videos, and
                  the writing community.
                </p>
                <p className="">
                  Through his debut novel <strong>Crownfall</strong> and the{" "}
                  <strong>Author Adjacent</strong> podcast, Michael explores
                  themes of power, justice, and survival while sharing the
                  challenges and victories of the writing life. His approach to
                  storytelling emphasizes complex characters facing impossible
                  choices, intricate world-building that serves the narrative,
                  and themes that resonate with real human experiences, even in
                  fantastical settings.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-secondary"
                    />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900 block">
                      Location
                    </span>
                    <span className="text-gray-600">Fort Worth, Texas</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} className="text-secondary" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900 block">
                      Focus
                    </span>
                    <span className="text-gray-600">Nobledark Fantasy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="aspect-square bg-secondary rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                <div className="text-center z-10">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-900 text-8xl mb-4"
                  />
                  <p className="text-gray-900 font-bold text-xl">
                    Michael Vadney
                  </p>
                  <p className="text-gray-900/80 text-sm mt-2">
                    Author Photo Coming Soon
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                </div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-lg rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Writing Philosophy */}
        <div className="bg-gray-50 border border-gray-200 text-gray-900 p-12 lg:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
          </div>
          <div className="relative text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Writing <span className="text-secondary">Philosophy</span>
            </h2>
            <blockquote className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed italic">
              "Every story worth telling explores the space between who we are
              and who we could become. In fantasy, we get to ask the biggest
              questions about power, justice, and survival, and maybe find some
              answers along the way."
            </blockquote>
          </div>
        </div>
        <NewsLetter
          title={
            <>
              Join the <span className="text-secondary">Journey</span>
            </>
          }
          description="Whether you're a fellow hobbyist writer or just curious about the
            book community, you're welcome to follow along as we navigate this
            journey together."
        />
      </div>
    </div>
  );
};

export default AboutPage;
