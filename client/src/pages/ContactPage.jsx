import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faThreads, faBluesky } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope as faEnvelopeSolid, faBriefcase as faBriefcaseSolid } from "@fortawesome/free-solid-svg-icons";
const ContactPage = () => {
  const socialLinks = [
    {
      platform: "X (Twitter)",
      handle: "@Michael_Vadney",
      url: "https://x.com/Michael_Vadney",
      icon: <FontAwesomeIcon icon={faXTwitter} />,
      color: "hover:bg-blue-500",
      description: "Personal updates and writing thoughts",
    },
    {
      platform: "Author Adjacent",
      handle: "@AuthorAdjacent",
      url: "https://x.com/AuthorAdjacent",
      icon: <FontAwesomeIcon icon={faXTwitter} />,
      color: "hover:bg-secondary",
      description: "Podcast updates and writing community",
    },
    {
      platform: "Bluesky",
      handle: "@michaelvadney.bsky.social",
      url: "https://bsky.app/profile/michaelvadney.bsky.social",
      icon: <FontAwesomeIcon icon={faBluesky} />,
      color: "hover:bg-sky-500",
      description: "Alternative social platform presence",
    },
    {
      platform: "Threads",
      handle: "@michael_vadney",
      url: "https://www.threads.com/@michael_vadney",
      icon: <FontAwesomeIcon icon={faThreads} />,
      color: "hover:bg-gray-800",
      description: "Casual conversations and updates",
    },
    {
      platform: "Instagram",
      handle: "@michael_vadney",
      url: "https://www.instagram.com/michael_vadney/",
      icon: <FontAwesomeIcon icon={faInstagram} />,
      color: "hover:bg-pink-500",
      description: "Behind-the-scenes content",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="mt-24  relative py-20 bg-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-secondary/20 backdrop-blur-sm p-6 rounded-full mb-8">
            <FontAwesomeIcon icon={faEnvelopeSolid} className="text-secondary text-8xl" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-teal-300 to-cyan-300">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether it's business, podcast topics, or just to say hello—I'd love to hear from you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        {/* Contact Methods */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Business Inquiries */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-secondary to-secondary-dark p-6 rounded-full mb-6 shadow-lg">
                <FontAwesomeIcon icon={faBriefcaseSolid} className="text-gray-900 text-4xl" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Business Inquiries</h2>
              <p className="text-gray-600">Professional opportunities and collaborations</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-secondary text-xl">📧</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Primary Email</p>
                    <a
                      href="mailto:mjvadney@gmail.com"
                      className="text-secondary hover:text-secondary-dark transition-colors text-lg font-semibold hover:underline">
                      mjvadney@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="mr-2">✨</span>
                  Perfect for:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Publishing opportunities and agent inquiries",
                    "Writing collaborations and partnerships",
                    "Media interviews and press requests",
                    "Speaking engagements and events",
                    "General business and professional matters",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-secondary mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Podcast Topics */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-full mb-6 shadow-lg">
                <span className="text-gray-900 text-4xl">🎙️</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Podcast Topics</h2>
              <p className="text-gray-600">Ideas, feedback, and guest suggestions</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🎙️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Author Adjacent Podcast</p>
                    <a
                      href="mailto:authorAdjacent@gmail.com"
                      className="text-purple-600 hover:text-purple-700 transition-colors text-lg font-semibold hover:underline">
                      authorAdjacent@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="mr-2">🎯</span>
                  Great for:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Episode topic suggestions and ideas",
                    "Guest appearance requests",
                    "Writing craft discussions and Q&A",
                    "Author journey stories and experiences",
                    "Podcast feedback and suggestions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Follow the <span className="text-secondary">Journey</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            Stay connected across platforms for updates, behind-the-scenes content, and conversations about the writing life.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${social.color} p-6 text-center`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{social.icon}</div>
                <div className="font-semibold text-lg mb-1">{social.platform}</div>
                <div className="text-sm opacity-75 mb-2">{social.handle}</div>
                <div className="text-xs opacity-60">{social.description}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Response Time & Expectations */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
              <span className="text-3xl">⏰</span>
            </div>
            <h3 className="font-bold text-green-800 text-xl mb-3">Response Time</h3>
            <p className="text-green-700">
              Typical response within <span className="font-semibold">24-48 hours</span>
            </p>
            <p className="text-green-600 text-sm mt-2">Sometimes faster, occasionally longer during busy periods</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h3 className="font-bold text-blue-800 text-xl mb-3">Best Practices</h3>
            <p className="text-blue-700 text-sm">Clear subject lines and specific questions help me provide better, faster responses</p>
            <p className="text-blue-600 text-sm mt-2">Don't hesitate to reach out—I appreciate every message!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
