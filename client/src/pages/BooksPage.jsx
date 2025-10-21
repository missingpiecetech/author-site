import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
const BooksPage = () => {
  const books = [
    {
      id: 1,
      title: "Crownfall",
      subtitle: "Trust is the hardest Lesson",
      blurb: (
        <>
          Nearly a decade under the empire’s grip has left Burunt a troubled
          land, its unrest simmering beneath a fragile surface.
          <br />
          Kyndel Heim knows the truth behind the Viceroy’s rise to power. After
          years of torture and experimentation, his only goal is vengeance. But
          to master his powers he needs a mentor, one that won’t kill him first.
          <br />
          Major Jelert Egarro travelled to Burunt to build a better world. But
          in the wrong hands, his skills become a tool of destruction, and those
          hands are everywhere. Jelert must decide whether to stay true to his
          ideals or let others dictate his path.
          <br />
          Lady Amara Khar rose fast when her once-powerful family fell. Sharp
          and ruthless, she’s kept her house alive through illicit trade, but
          clawing back power in Burunt means making enemies and unsavory
          friends.
          <br />
          In the fight for power, justice, and survival, everyone must decide:
          who they will become?
        </>
      ),
      quote:
        "In the fight for power, justice, and survival, everyone must decide: who they will become?",
      release: "February 28, 2026",
      status: "Coming Soon",
      statusColor: "from-emerald-500 to-teal-600",
      coverColor: "from-slate-700 via-gray-800 to-slate-900",
      genres: ["Nobledark Fantasy", "Dark Fantasy", "Adventure"],
    },
    {
      id: 2,
      title: "Chrono-Stained",
      subtitle: "Where Time Bends and Reality Fractures",
      summary:
        "A thrilling adventure through time where past and future collide in unexpected ways. Fullmetal Alchemist meets the Licanius Trilogy in this upcoming fantasy epic.",
      fullSummary:
        "When the fabric of time itself becomes a battlefield, heroes must navigate through fractured realities to save not just their world, but all possible worlds. Every choice echoes across timelines, and every decision could unravel existence itself.",
      quote:
        "Time is not a river, but a storm—and we are all caught in its eye.",
      release: "TBA",
      status: "in World Building",
      statusColor: "from-amber-500 to-orange-600",
      coverColor: "from-indigo-600 via-purple-700 to-pink-700",
      genres: ["Time Travel", "Sci-Fantasy", ""],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mt-24  relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-secondary/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/5 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-secondary/8 rounded-full animate-float-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
              Books & <span className="text-secondary">Works</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Nobledark fantasy worlds where the worlds are dark and the
              characters are hopeful.
            </p>
            {/* <div className="flex flex-wrap justify-center gap-4 text-lg">
              <span className="bg-secondary/10 text-secondary px-6 py-3 rounded-full font-semibold">
                Nobledark Fantasy
              </span>
              <span className="bg-secondary/10 text-secondary px-6 py-3 rounded-full font-semibold">
                Dark Fantasy
              </span>
              <span className="bg-secondary/10 text-secondary px-6 py-3 rounded-full font-semibold">
                Adventure
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="max-w-full py-32 px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-32">
          {books.map((book, index) => (
            <div key={book.id} className="relative">
              <div className="grid lg:grid-cols-5 gap-16 items-center">
                {/* Book Cover - Left side for odd index, right side for even */}
                <div
                  className={`lg:col-span-2 ${index % 2 === 1 ? "lg:order-2" : ""}`}
                >
                  <div className="relative group">
                    <div
                      className={`aspect-[3/4] bg-gradient-to-br ${book.coverColor} rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden transform group-hover:scale-105 transition-all duration-500`}
                    >
                      {/* Book cover design */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      <div className="text-center z-10 p-8">
                        <FontAwesomeIcon
                          icon={faBook}
                          className="text-white text-8xl mb-6"
                        />
                        <h3 className="text-white font-bold text-2xl mb-3">
                          {book.title}
                        </h3>
                        <p className="text-white/80 text-lg">{book.subtitle}</p>
                      </div>

                      {/* Decorative elements */}
                      <div className="absolute top-6 right-6 w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      </div>
                      <div className="absolute bottom-6 left-6 w-10 h-10 border border-white/20 rounded-lg rotate-45"></div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute -top-6 -right-6 z-20">
                      <span
                        className={`inline-block bg-gradient-to-r ${book.statusColor} text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl`}
                      >
                        {book.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div
                  className={`lg:col-span-3 ${index % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  <div className="space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                    <div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                        {book.title}
                      </h2>
                      <p className="text-2xl text-secondary font-medium">
                        {book.subtitle}
                      </p>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-3">
                      {book.genres.map((genre) => (
                        <span
                          key={genre}
                          className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-lg font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <div className="max-w-none">
                      <p className="text-gray-700 leading-relaxed text-xl">
                        {book.blurb}
                      </p>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {book.fullSummary}
                      </p>
                    </div>

                    {/* Quote */}
                    <blockquote className="border-l-4 border-secondary pl-8 py-6 bg-gray-50 rounded-r-2xl">
                      <p className="text-gray-800 italic text-xl leading-relaxed">
                        "{book.quote}"
                      </p>
                    </blockquote>

                    {/* Book Details Grid */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="text-secondary text-xl">📅</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-lg">
                              Release Date
                            </span>
                            <span className="text-gray-600 text-lg">
                              {book.release}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="text-secondary text-xl">🛒</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-lg">
                              Availability
                            </span>
                            <span className="text-gray-600 text-lg">
                              Pre-order Soon
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6">
                      <button
                        disabled
                        className="bg-gray-200 text-gray-500 px-8 py-4 rounded-full cursor-not-allowed font-semibold transition-all duration-200 shadow-sm flex-1 sm:flex-none text-lg"
                      >
                        Pre-order Coming Soon
                      </button>
                      <button className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 flex-1 sm:flex-none text-lg transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Add to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              {index < books.length - 1 && (
                <div className="mt-32 flex justify-center">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-32 bg-gray-50 p-12 lg:p-16 rounded-3xl shadow-2xl relative overflow-hidden border border-gray-200">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-20 h-20 bg-secondary/10 rounded-full animate-float"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-secondary/5 rounded-full animate-float-delayed"></div>
          </div>
          <div className="relative text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Never Miss a <span className="text-secondary">Release</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Be the first to know about new book releases, exclusive excerpts,
              and behind-the-scenes content from the writing process.
            </p>
            <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-lg border border-gray-200">
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                <button className="w-full bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Subscribe for Updates
                </button>
                <p className="text-xs text-gray-500">
                  No spam, unsubscribe at any time. Updates only when there's
                  real news to share.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
