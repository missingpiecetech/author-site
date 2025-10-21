import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { GiCrystalGrowth } from "react-icons/gi";

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/podcast", label: "Podcast" },
    { path: "/books", label: "Books" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY < 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky  bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 z-50 border-b border-gray-100 ${
        atTop
          ? "top-4 left-4 right-4 rounded-xl"
          : "top-0 left-0 w-full rounded-none"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            {/* Logo Placeholder */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <GiCrystalGrowth className="text-white text-2xl" />
              </div>
              <div className="hidden sm:block">
                <div className="text-gray-900 text-xl font-bold tracking-tight">
                  Michael Vadney
                </div>
                <div className="text-secondary text-sm font-medium">
                  Fantasy Author
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-gray-700 hover:text-secondary hover:bg-secondary/5 transition-all duration-200 px-6 py-3 rounded-full text-sm font-semibold tracking-wide relative group ${
                  location.pathname === item.path
                    ? "text-secondary bg-secondary/10"
                    : ""
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-secondary focus:outline-none transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-gray-700 hover:text-secondary hover:bg-secondary/5 transition-all duration-200 block px-4 py-3 rounded-lg text-base font-semibold ${
                    location.pathname === item.path
                      ? "text-secondary bg-secondary/10"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
