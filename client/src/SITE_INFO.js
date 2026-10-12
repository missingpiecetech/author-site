// Site-wide constants. Copy here is the site's existing copy.
const SITE_INFO = {
  name: "Michael Vadney",
  tagline: "Author & Podcaster",
  location: "Fort Worth, Texas",
  emails: {
    business: "mjvadney@gmail.com",
    podcast: "AuthorAdjacent@gmail.com",
  },
  pressKit:
    "https://drive.google.com/drive/folders/14IFIoZJv-jHsS2bXliF1bx5kUXnI9_bC?usp=sharing",
  // MailerLite popup form opened by "Join the Circle" / "Subscribe".
  newsletterFormId: "oQiRIg",
  // The single switch for international shipping: ShippingNotice renders only
  // while usOnly is true. Checkout's address handling lives in the protected
  // Square files and changes in its own PR.
  shipping: { usOnly: true },
};

export default SITE_INFO;
