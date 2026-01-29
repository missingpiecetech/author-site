import SOCIAL_LINKS from "../SOCIAL_LINKS";

const Socials = () => (
  <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
      Connect & Follow the Journey
    </h2>
    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
      Stay updated on writing progress, podcast episodes, and behind-the-scenes
      insights from the author life.
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${social.color} p-6 text-center`}
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {social.icon}
          </div>
          <div className="font-semibold text-lg mb-1">{social.platform}</div>
          <div className="text-sm opacity-75">{social.handle}</div>
        </a>
      ))}
    </div>
  </div>
);

export default Socials;
