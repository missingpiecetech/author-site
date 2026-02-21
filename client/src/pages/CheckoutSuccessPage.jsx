import { Link } from "react-router-dom";

const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mt-24 relative py-32 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-secondary/10 rounded-full"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/5 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
              Thank <span className="text-secondary">You</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Thank you for purchasing the book. Your order was successfully
              submitted.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-3xl p-10 shadow-xl text-center">
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            You should receive order details from Square shortly. If you have
            any questions, reach out through the contact page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/store"
              className="inline-block bg-secondary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary-dark transition-colors"
            >
              Back to Store
            </Link>
            <Link
              to="/books"
              className="inline-block bg-secondary/10 text-secondary px-6 py-3 rounded-full font-semibold hover:bg-secondary/20 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;