import Navigation from "./Navigation";
import Footer from "./Footer";
import NewsLetter from "./NewsLetter";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-ground text-cream">
      <Navigation />
      <main className="flex-1">
        {children}
        <NewsLetter />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
