import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PodcastPage from "./pages/PodcastPage";
import BooksPage from "./pages/BooksPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import StorePage from "./pages/StorePage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ExcerptPage from "./pages/ExcerptPage";
import { NotFoundPage } from "./pages/ErrorPage";
import PageErrorBoundary from "./components/PageErrorBoundary";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { pathname } = useLocation();
  return (
    <PageErrorBoundary key={pathname}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/podcast" element={<PodcastPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route
          path="/books/crownfall/excerpt"
          element={<ExcerptPage slug="crownfall" />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageErrorBoundary>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
