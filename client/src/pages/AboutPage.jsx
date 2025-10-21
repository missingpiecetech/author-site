import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faThreads, faBluesky } from "@fortawesome/free-brands-svg-icons";
import { faBook, faPodcast, faPenNib, faStar, faMapMarkerAlt, faUser } from "@fortawesome/free-solid-svg-icons";
const AboutPage = () => {
  const socialLinks = [
    {
      platform: "X (Twitter)",
      url: "https://x.com/Michael_Vadney",
      icon: <FontAwesomeIcon icon={faXTwitter} />,
      color: "hover:bg-blue-500",
      handle: "@Michael_Vadney",
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
      color: "hover:bg-gray-800",
      handle: "@michael_vadney",
    },
    {
      platform: "Instagram",
      url: "https://www.instagram.com/michael_vadney/",
      icon: <FontAwesomeIcon icon={faInstagram} />,
      color: "hover:bg-pink-500",
      handle: "@michael_vadney",
    },
  ];

  const achievements = [
    {
      icon: <FontAwesomeIcon icon={faBook} />,
      title: "Upcoming Novel",
      description: "Crownfall - releasing February 28, 2026",
    },
    {
      icon: <FontAwesomeIcon icon={faPodcast} />,
      title: "Author Adjacent Podcast",
      description: "Honest conversations about the writing journey",
    },
    {
      icon: <FontAwesomeIcon icon={faPenNib} />,
      title: "Active Writer",
      description: "Currently developing multiple fantasy projects",
    },
    {
      icon: <FontAwesomeIcon icon={faStar} />,
      title: "Community Builder",
      description: "Supporting aspiring authors through content and conversation",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="mt-24  relative py-32 bg-white">
        <div className="relative w-full text-center">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight mb-6">
            About <span className="text-secondary">Michael</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Fantasy Author & Podcaster from Fort Worth, Texas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        {/* Author Profile Section */}
        <div className="grid lg:grid-cols-5 gap-12 items-center mb-20">
          {/* Profile Image */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="aspect-square bg-secondary rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                <div className="text-center z-10">
                  <FontAwesomeIcon icon={faUser} className="text-gray-900 text-8xl mb-4" />
                  <p className="text-gray-900 font-bold text-xl">Michael Vadney</p>
                  <p className="text-gray-900/80 text-sm mt-2">Author Photo Coming Soon</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                </div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-lg rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Journey Continues</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                  Michael Vadney is a fantasy author and podcaster based in Fort Worth, Texas, who believes in the power of honest
                  storytelling—both in fiction and in life. His journey from hobbyist writer to professional author is one of persistence,
                  learning, and authentic connection with fellow creators.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Through his upcoming novel "Crownfall" and the "Author Adjacent" podcast, Michael explores themes of power, justice, and
                  survival while sharing the real challenges and victories of the writing life. His work reflects a commitment to complex
                  characters, intricate world-building, and the belief that every voice in the writing community matters.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-secondary" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Location</span>
                    <span className="text-gray-600">Fort Worth, Texas</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} className="text-secondary" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Focus</span>
                    <span className="text-gray-600">Epic Fantasy Fiction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Current <span className="text-secondary">Endeavors</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">Connect & Follow the Journey</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay updated on writing progress, podcast episodes, and behind-the-scenes insights from the author life.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${social.color} p-6 text-center`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{social.icon}</div>
                <div className="font-semibold text-lg mb-1">{social.platform}</div>
                <div className="text-sm opacity-75">{social.handle}</div>
              </a>
            ))}
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
              "Every story worth telling explores the space between who we are and who we could become. In fantasy, we get to ask the
              biggest questions about power, justice, and survival—and maybe find some answers along the way."
            </blockquote>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-gray-600 leading-relaxed">
                Michael's approach to storytelling emphasizes complex characters facing impossible choices, intricate world-building that
                serves the narrative, and themes that resonate with real human experiences—even in fantastical settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
