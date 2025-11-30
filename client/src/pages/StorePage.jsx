import ShoppingCart from "../components/ShoppingCart";
import useCart from "../hooks/useCart";

const StorePage = () => {
  const { addItem } = useCart();

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="mt-24 relative py-32 bg-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-22 left-13 w-24 h-24 bg-secondary/10 rounded-full"></div>
            <div className="absolute top-41 right-22 w-32 h-32 bg-secondary/5 rounded-full"></div>
            <div className="absolute bottom-28 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
          </div>
          <div className="relative w-full text-center">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight mb-6">
              Book <span className="text-secondary">Store</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Coming Soon: Explore and purchase my latest works and exclusive
              merchandise right here.
            </p>
          </div>
        </div>

        {/* Crownfall */}
        <div
          className=" py-20 px-4 sm:px-6 lg:px-8 relative"
          style={{
            backgroundImage: "url('../src/assets/crownfall_cover.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative bg-gray-50 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Crownfall Series
            </h2>
            <p className="text-gray-700 mb-8">
              Dive into the epic fantasy world of Crownfall, where magic,
              intrigue, and adventure await. Available in paperback and eBook
              formats.
            </p>
            <div className="space-x-4">
              <button
                className="inline-block bg-secondary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary-dark transition-colors"
                onClick={() =>
                  addItem({
                    id: "paperback",
                    name: "Crownfall Paperback",
                    price: 19.99,
                  })
                }
              >
                Buy Paperback
              </button>
              <button
                className="inline-block bg-secondary/10 text-secondary px-6 py-3 rounded-full font-semibold hover:bg-secondary/20 transition-colors"
                onClick={() =>
                  addItem({
                    id: "ebook",
                    name: "Crownfall Hardback",
                    price: 24.99,
                  })
                }
              >
                Buy Hardback
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePage;
