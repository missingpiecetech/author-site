import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PodcastPage from "./pages/PodcastPage";
import BooksPage from "./pages/BooksPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import StorePage from "./pages/StorePage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/podcast" element={<PodcastPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
