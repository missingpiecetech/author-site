import { BOOKS, BOOK_STATUS } from "../BOOK_DATA";
import NewsLetter from "../components/NewsLetter";

const BooksPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mt-24 relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-secondary/10 rounded-full"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/5 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
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
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="max-w-full py-32 px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-16">
          {BOOKS.map((book, index) => (
            <div
              id={book.title.toLowerCase()}
              key={book.id}
              className="relative"
            >
              <div className="grid lg:grid-cols-5 gap-16 items-center relative">
                <div
                  className={`lg:col-span-2 lg:sticky ${index % 2 === 1 ? "lg:order-2" : ""}`}
                >
                  <div
                    className={`aspect-[3/4] bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-all duration-500`}
                  >
                    {/* Book cover design */}
                    <div className="text-white text-8xl md:text-10xl item">
                      {book.icon}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute -top-6 -right-6 z-20">
                    <span
                      className={`inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl`}
                    >
                      {book.status}
                    </span>
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
                      <p className="text-gray-700 leading-relaxed text-lg text-left">
                        {book.blurb}
                      </p>
                    </div>

                    {/* Quote */}
                    {book.quote && (
                      <blockquote className="border-l-4 border-secondary pl-8 py-6 bg-gray-50 rounded-r-2xl">
                        <p className="text-gray-800 italic text-xl leading-relaxed text-left">
                          {book.quote}
                        </p>
                      </blockquote>
                    )}

                    {/* Book Details Grid */}
                    {book.status === BOOK_STATUS.COMING_SOON && (
                      <div className="grid sm:grid-cols-2 gap-6 text-left">
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
                    )}

                    {/* Action Buttons */}
                    {book.status === BOOK_STATUS.RELEASED && (
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
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              {index < BOOKS.length - 1 && (
                <div className="mt-15 flex justify-center">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        <NewsLetter
          title={
            <>
              Never Miss a <span className="text-secondary">Release</span>
            </>
          }
          description="Be the first to know about new book releases, exclusive excerpts, and
          behind-the-scenes content from the writing process."
        />
      </div>
    </div>
  );
};

export default BooksPage;
