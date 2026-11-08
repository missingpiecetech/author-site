import PageIntro from "../components/ui/PageIntro";
import Button from "../components/ui/Button";
import { BACKGROUNDS } from "../assets/backgrounds/index.js";
import { SERVER_FAILED } from "../../shared/errors.js";

/**
 * What a visitor sees when a page is missing or fails to show. Plain words only:
 * no status code, error code or library text.
 */
const ErrorPage = ({ title, accent, lede, actions }) => (
  <div data-testid="error-page" className="bg-ground">
    <PageIntro
      background={BACKGROUNDS.cracks}
      title={title}
      accent={accent}
      lede={lede}
    >
      <div className="mt-6 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
        {actions}
      </div>
    </PageIntro>
  </div>
);

export const NotFoundPage = () => (
  <ErrorPage
    title="Page Not"
    accent="Found"
    lede="We could not find that page. The link may be mistyped, or the page may have moved."
    actions={
      <>
        <Button to="/">Go to the Home Page</Button>
        <Button to="/books" variant="secondary">
          Browse Books
        </Button>
      </>
    }
  />
);

export const PageFailed = () => (
  <ErrorPage
    title="Something Went"
    accent="Wrong"
    lede={SERVER_FAILED}
    actions={
      <>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button href="/" external={false} variant="secondary">
          Go to the Home Page
        </Button>
      </>
    }
  />
);
