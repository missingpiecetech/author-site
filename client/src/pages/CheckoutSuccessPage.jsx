import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import { BACKGROUNDS } from "../assets/backgrounds/index.js";
import Button from "../components/ui/Button";
import { FiligreeCorners } from "../components/ui/Filigree";
import { FRAME_BORDER } from "../components/ui/filigree/index.js";
import { EVENTS, track } from "../lib/analytics.js";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const sent = useRef(false);

  // Square's redirect after payment adds orderId (and checkoutId,
  // transactionId) to the URL; a visit without it is not an order. The
  // parameters are then dropped so a reload does not count the order again.
  useEffect(() => {
    if (!orderId || sent.current) return;
    sent.current = true;
    track(EVENTS.ORDER_PLACED);
    navigate(pathname, { replace: true });
  }, [orderId, pathname, navigate]);

  return (
    <div className="min-h-screen bg-ground">
      <PageIntro
        background={BACKGROUNDS.harren}
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
