import React, { useState } from "react";

const NewsLetter = ({ title, description, card = true }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add subscription logic here
  };

  return (
    <div
      className={`mt-15 bg-white p-12 lg:p-16 ${card ? "rounded-3xl" : ""} shadow-2xl relative overflow-hidden border border-gray-200`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-secondary/10 rounded-full" />
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-secondary/5 rounded-full " />
      </div>
      <div className="relative text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
          {title}
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
        <div
          className={`bg-white max-w-md mx-auto items-center rounded-2xl ${!card && " p-6 shadow-lg border border-gray-200"}`}
        >
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
