import Navigation from "./Navigation";
import Footer from "./Footer";
import NewsLetter from "./NewsLetter";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
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
