import { useState } from "react";

const EmailSignup = ({ label = "Subscribe for Updates", buttonText = "Subscribe" }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add API logic here
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <h3 className="font-bold text-lg text-gray-900 mb-2">{label}</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-lg"
      />
      <button
        type="submit"
        className="w-full bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        disabled={submitted}>
        {submitted ? "Thank you!" : buttonText}
      </button>
      <p className="text-xs text-gray-500">No spam, unsubscribe at any time.</p>
    </form>
  );
};

export default EmailSignup;
