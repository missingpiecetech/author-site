import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import Button from "../components/ui/Button";
import { FiligreeCorners } from "../components/ui/Filigree";
import { FRAME_BORDER } from "../components/ui/filigree/index.js";

const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-screen bg-ground">
      <PageIntro
        title="Thank"
        accent="You"
        lede="Thank you for purchasing the book. Your order was successfully submitted."
      />

      <Section>
        <div
          className={`relative mx-auto flex max-w-3xl flex-col items-center gap-8 ${FRAME_BORDER} border-edge bg-well p-8 text-center lg:p-12`}
        >
          <p className="text-lede text-muted">
            You should receive order details from Square shortly. If you have
            any questions, reach out through the contact page.
          </p>
          <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
            <Button to="/store">Back to Store</Button>
            <Button to="/books" variant="secondary">
              Browse Books
            </Button>
          </div>
          <FiligreeCorners />
        </div>
      </Section>
    </div>
  );
};

export default CheckoutSuccessPage;
