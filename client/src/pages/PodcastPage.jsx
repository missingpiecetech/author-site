import EmailSignup from "../components/EmailSignup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";

const PodcastPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mt-24  relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-secondary/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/5 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-secondary/8 rounded-full animate-float-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
              Author <span className="text-secondary">Adjacent</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              From hobbyist writer to professional author—the honest journey
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 items-center mb-20">
          {/* Profile Image */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="aspect-square bg-secondary rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                <div className="text-center z-10">
                  {/* <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-900 text-8xl mb-4"
                  /> */}
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

          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About the Podcast
              </h2>
              <div className="prose prose-lg max-w-none text-left grid gap-5">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Author Adjacent</strong> is a weekly podcast hosted by
                  Michael Vadney, chronicling the journey from hobbyist writer
                  to published author. Through author interviews, bite sized
                  writing craft lessons, and book reviews, each episode delves
                  into the realities of writing, publishing, and the ups and
                  downs of pursuing a dream in the literary world.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Whether you're an aspiring author, a seasoned writer, or just
                  curious about the behind-the-scenes of book creation, this
                  podcast offers honest insights, practical advice, and a dose
                  of inspiration for anyone looking to make their mark in the
                  world of fiction.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Full episodes are available as audio on{" "}
                  <a
                    href="https://open.spotify.com/show/1PLTufzD1727pDp6xCR97h"
                    className="text-secondary underline"
                  >
                    Spotify
                  </a>{" "}
                  or video on{" "}
                  <a
                    href="https://www.youtube.com/@AuthorAdjacent"
                    className="text-secondary underline"
                  >
                    YouTube
                  </a>
                  .
                </p>
                <p className="text-gray-700 leading-relaxed">
                  New episodes are released every Friday. Tune in and join the
                  journey!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Connect */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Connect with Author Adjacent
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the community of aspiring authors and follow along with the
            writing journey.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <a
              href="https://x.com/AuthorAdjacent"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-50 hover:bg-blue-500 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 p-6 text-center"
            >
              <FontAwesomeIcon
                icon={faXTwitter}
                className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="font-semibold text-lg mb-1">Follow on X</div>
              <div className="text-sm opacity-75">@AuthorAdjacent</div>
            </a>

            <a
              href="https://www.youtube.com/@AuthorAdjacent"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-50 hover:bg-red-600 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 p-6 text-center"
            >
              <FontAwesomeIcon
                icon={faYoutube}
                className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="font-semibold text-lg mb-1">
                Subscribe on YouTube
              </div>
              <div className="text-sm opacity-75">@AuthorAdjacent</div>
            </a>

            <a
              href="/contact"
              className="group bg-gray-50 hover:bg-secondary hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 p-6 text-center"
            >
              <FontAwesomeIcon
                icon={faMicrophone}
                className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="font-semibold text-lg mb-1">Suggest Topics</div>
              <div className="text-sm opacity-75">Contact Us</div>
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white  text-gray-900 p-12 lg:p-16 relative overflow-hidden">
        <div className="relative text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Join the <span className="text-secondary">Journey</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Whether you're a fellow hobbyist writer or just curious about the
            book community, you're welcome to follow along as we navigate this
            journey together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <EmailSignup label="Subscribe for Updates" buttonText="Subscribe" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPage;
