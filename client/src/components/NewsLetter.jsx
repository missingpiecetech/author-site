import React from "react";

const NewsLetter = () => {
  const titles = [
    <>
      Join the <span className="text-secondary">Journey</span>
    </>,
    <>
      Never Miss a <span className="text-secondary">Release</span>
    </>,
    <>
      Receive <span className="text-secondary">Updates</span>
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
    <div
      className={`bg-white p-12 lg:p-16  relative overflow-hidden border border-gray-200`}
    >
      <div className="relative text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
          {title}
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
        <div className={`bg-white max-w-md mx-auto items-center rounded-2xl`}>
          <div className="space-y-4">
            <button
              id={`subscribe-button`}
              className="subscribe-button w-full cursor-pointer bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => ml("show", "oQiRIg", true)}
            >
              Subscribe for Updates
            </button>

            <p className="text-xs text-gray-500">
              No spam, unsubscribe at any time. Updates only when there's real
              news to share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
