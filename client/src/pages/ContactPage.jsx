import Socials from "../components/Socials";

import {
  GiOldMicrophone,
  GiSuitcase,
  GiLightBulb,
  GiExtraTime,
} from "react-icons/gi";
const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="mt-24 relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-15 left-20 w-24 h-24 bg-secondary/10 rounded-full"></div>
          <div className="absolute top-20 right-30 w-32 h-32 bg-secondary/5 rounded-full"></div>
          <div className="absolute bottom-25 left-1/5 w-28 h-28 bg-secondary/8 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
              Get in <span className="text-secondary">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Whether it's business, podcast topics, or just to say hello—I'd
              love to hear from you
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        {/* Contact Methods */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Business Inquiries */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Business Inquiries
              </h2>
              <p className="text-gray-600">
                Professional opportunities and collaborations
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br to-secondary from-secondary-dark rounded-full flex items-center justify-center">
                    <GiSuitcase className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-lg">
                      Primary Email
                    </p>
                    <a
                      href="mailto:mjvadney@gmail.com"
                      className="text-secondary hover:text-secondary-dark transition-colors text-lg font-semibold hover:underline"
                    >
                      mjvadney@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
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
                      <span className="text-secondary mr-3 mt-1 flex-shrink-0">
                        •
                      </span>
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Podcast Topics
              </h2>
              <p className="text-gray-600">
                Ideas, feedback, and guest suggestions
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                    <GiOldMicrophone className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-lg">
                      Author Adjacent Podcast
                    </p>
                    <a
                      href="mailto:AuthorAdjacent@gmail.com"
                      className="text-secondary hover:text-secondary-dark transition-colors text-lg font-semibold hover:underline"
                    >
                      AuthorAdjacent@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
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
                      <span className="text-secondary mr-3 mt-1 flex-shrink-0">
                        •
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time & Expectations */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
              <GiExtraTime className="text-green-600 text-2xl" />
            </div>
            <h3 className="font-bold text-green-800 text-xl mb-3">
              Response Time
            </h3>
            <p className="text-green-700">
              Typical response within{" "}
              <span className="font-semibold">24-48 hours</span>
            </p>
            <p className="text-green-600 text-sm mt-2">
              Sometimes faster, occasionally longer during busy periods
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <GiLightBulb className="text-blue-600 text-3xl" />
            </div>
            <h3 className="font-bold text-blue-800 text-xl mb-3">
              Best Practices
            </h3>
            <p className="text-blue-700 text-sm">
              Clear subject lines and specific questions help me provide better,
              faster responses
            </p>
            <p className="text-blue-600 text-sm mt-2">
              Don't hesitate to reach out—I appreciate every message!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
