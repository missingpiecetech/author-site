import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import Button from "../components/ui/Button";

const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-screen bg-ground">
      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute top-20 left-10 h-24 w-24 rounded-full bg-accent/10"></div>
          <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-accent/6"></div>
          <div className="absolute bottom-20 left-1/4 h-28 w-28 rounded-full bg-accent/8"></div>
        </div>
        <PageIntro
          className="relative"
          align="center"
          title="Thank"
          accent="You"
          lede="Thank you for purchasing the book. Your order was successfully submitted."
        />
      </div>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 border border-edge bg-well p-8 text-center lg:p-12">
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
        </div>
      </Section>
    </div>
  );
};

export default CheckoutSuccessPage;
