import { Link, useLocation } from "react-router-dom";
import { useState, useLayoutEffect } from "react";
import ShoppingCart, { CartIcon } from "./ShoppingCart";
import JoinCircleButton from "./JoinCircleButton";
import useCart from "../hooks/useCart";
import SITE_INFO from "../SITE_INFO";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/books", label: "Books" },
  { path: "/podcast", label: "Podcast" },
  { path: "/about", label: "About" },
  { path: "/store", label: "Store" },
  { path: "/contact", label: "Contact" },
];

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems, setCartOpen } = useCart();

  useLayoutEffect(() => {
    // New page: start at the top, unless a hash asks for a section
    // (useHashScroll on that page handles it).
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-rule bg-ground">
      <nav
        aria-label="Main"
        className="flex h-full items-center justify-between gap-6 px-5 lg:px-20"
      >
        <Link
          to="/"
          className="font-display text-2xl font-semibold tracking-[0.04em] whitespace-nowrap text-cream transition-colors hover:text-accent-hover lg:text-[1.875rem]"
        >
          {SITE_INFO.name}
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 text-[1.0625rem] xl:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`border-b pb-1 transition-colors hover:text-accent-hover ${
                  isActive(item.path)
                    ? "border-accent text-accent"
                    : "border-transparent text-cream"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 lg:gap-4">
          <ShoppingCart />
          <div className="hidden sm:block">
            <JoinCircleButton />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-btn border border-outline text-cream transition-colors hover:border-accent xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile / tablet menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-b border-rule bg-ground px-6 pt-2 pb-8 xl:hidden"
        >
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex h-14 items-center justify-between border-b border-rule font-display text-2xl font-semibold transition-colors hover:text-accent-hover ${
                    isActive(item.path) ? "text-accent" : "text-cream"
                  }`}
                >
                  {item.label}
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                data-testid="mobile-cart-button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setCartOpen(true);
                }}
                className="flex h-14 w-full cursor-pointer items-center gap-3 border-b border-rule font-display text-2xl font-semibold text-cream transition-colors hover:text-accent-hover"
              >
                <CartIcon className="h-5 w-5 text-accent" />
                Cart ({totalItems()})
              </button>
            </li>
          </ul>
          <div className="mt-6 sm:hidden">
            <JoinCircleButton
              size="lg"
              block
              onClick={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
