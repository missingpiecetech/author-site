import React, { useState } from "react";

const NewsLetter = ({ title, description, card = true }) => {
  const [email, setEmail] = useState("");

  const isValidEmail = (email) => {
    // Simple email regex for validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    // TODO: Add subscription logic here
  };

  return (
    <div
      className={`bg-white p-12 lg:p-16 ${card ? "rounded-3xl shadow-2xl mt-15" : ""}  relative overflow-hidden border border-gray-200`}
    >
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
            {error && <p className="text-xs text-red-500">{error}</p>}
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
