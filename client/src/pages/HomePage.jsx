import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BOOKS } from "../BOOK_DATA";
import NewsLetter from "../components/NewsLetter";

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    AOS.init({ once: true, duration: 800 });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Floating Circles */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Floating Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/50 rounded-full" />
          <div className="absolute bottom-40 left-1/10 w-40 h-40 bg-secondary/50 rounded-full" />
          <div className="absolute top-40 right-1/4 w-24 h-24 bg-secondary/50 rounded-full" />
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-secondary/50 rounded-full" />
        </div>
        {/* Hero Content Side-by-Side */}
        <div className="relative flex flex-row flex-wrap items-center justify-around md:text-left">
          {/* Author Image */}
          <div className="flex relative m-8 mt-40 mb-4 md:mt-8 md:m-24">
            <img
              src="/src/assets/author_pic.jpeg"
              alt="Michael Vadney"
              className="w-80 h-80 rounded-full object-cover outline-10 outline-secondary z-25"
            />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary-dark rounded-full" />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-secondary-dark rounded-full" />
          </div>
          {/* Author Text */}
          <div
            className="w-1/2 flex-1 space-y-1 text-center"
            data-aos="fade-left"
          >
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
              <span className="block animate-slide-in-left">
                Michael Vadney
              </span>
            </h1>
            <h5 className="text-3xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Author & Podcaster
            </h5>
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in-up delay-700">
              <Link
                to="/books"
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                Explore My Books
              </Link>
              <Link
                to="/podcast"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                Watch the Podcast
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-secondary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-secondary/60 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Featured Books Section - Broader Horizontal Layout */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-full px-8 lg:px-16">
          <div
            className="text-center mb-20 animate-fade-in-up"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Latest <span className="text-secondary">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Worlds where hope and heroism endure amid darkness, sacrifice, and
              moral complexity.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="space-y-16">
              {BOOKS.map((book, index) => (
                <div key={index} className="group animate-slide-in-left">
                  <div className="bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                      <div className="lg:col-span-1">
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-48 h-72 mx-auto rounded-2xl shadow-2xl transform group-hover:rotate-3 transition-transform duration-500 object-cover"
                          />
                        ) : (
                          <div className="w-48 h-72 mx-auto bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900  rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-500 text-white text-6xl">
                            {book.icon}
                          </div>
                        )}
                      </div>
                      <div className="lg:col-span-4 text-center lg:text-left space-y-6">
                        <div className="space-y-4">
                          <span className="inline-block bg-gray-700 text-white px-6 py-2 rounded-full text-lg font-semibold">
                            {book.status}
                          </span>
                          <h3 className="text-4xl md:text-5xl font-bold text-gray-900">
                            {book.title}
                          </h3>
                          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                            {book.shortBlurb}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                          {book.genres.map((genre) => (
                            <span
                              key={genre}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={book.link}
                          className="inline-flex items-center bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 group"
                        >
                          Learn More
                          <span className="ml-3 transform group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Author Adjacent Podcast Section */}
      <section className="py-32 bg-white">
        <div className="max-w-full px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-gray-900 animate-fade-in-up flex flex-col space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold">
                  Author <span className="text-secondary">Adjacent</span>
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed text-center lg:text-left">
                  Join the honest conversation about the writing journey from
                  hobbyist writer to professional author.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg text-center lg:text-left">
                  Every episode dives deep into the challenges, victories, and
                  everything in between on the path to becoming a published
                  author. Real talk, practical advice, and community support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link
                    to="/podcast"
                    className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Learn More
                  </Link>
                  <a
                    href="https://youtube.com/@AuthorAdjacent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>

              <div className="relative animate-scale-in">
                <div className="aspect-square bg-secondary rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                  <img
                    src="/src/assets/author_adjacent_logo_no_text.jpeg"
                    alt="Author Adjacent Podcast Cover"
                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsLetter
        title={
          <>
            Stay <span className="text-secondary">Connected</span>
          </>
        }
        description="Get updates on new releases, podcast episodes, and
              behind-the-scenes insights from the writing journey."
        card={false}
      />
    </div>
  );
};

export default HomePage;
