import { useParams } from "react-router-dom";

const infoContent = {
  "privacy-policy": {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "This Privacy Policy describes how Saurene (\"we\", \"us\", or \"our\") collects, uses, and discloses your personal information when you visit our website, place an order, or otherwise interact with us (collectively, the \"Services\").",
          "By accessing or using our Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy."
        ]
      },
      {
        heading: "Information We Collect",
        paragraphs: [
          "We collect personal information to provide and improve our Services. The type of information collected depends on how you interact with us.",
          "Information You Provide Directly",
          "This may include:"
        ],
        bullets: [
          "Name, email address, phone number",
          "Billing and shipping address",
          "Order and payment confirmation details",
          "Account credentials (if applicable)",
          "Customer support communications"
        ]
      },
      {
        heading: "Information Collected Automatically",
        paragraphs: ["When you visit our website, we may automatically collect:"],
        bullets: [
          "Device and browser information",
          "IP address",
          "Usage data such as pages viewed, interactions, and browsing behavior"
        ]
      },
      {
        heading: "Information from Third Parties",
        paragraphs: ["We may receive information from trusted third-party service providers such as:"],
        bullets: [
          "Payment processors (to securely process transactions)",
          "Shipping and fulfillment partners",
          "Website analytics and marketing service providers"
        ]
      },
      {
        heading: "How We Use Your Information",
        paragraphs: ["We use your personal information to:"],
        bullets: [
          "Process orders and deliver products",
          "Communicate order updates and customer support responses",
          "Manage accounts and transactions",
          "Improve our website, services, and offerings",
          "Send marketing or promotional communications (you may opt out anytime)",
          "Detect and prevent fraud or misuse"
        ]
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use cookies and similar technologies to:",
          "Enable core website functionality",
          "Remember your preferences",
          "Understand how visitors interact with our website",
          "You can manage or disable cookies through your browser settings. Please note that disabling cookies may affect certain features of the website."
        ]
      },
      {
        heading: "Sharing of Personal Information",
        paragraphs: ["We may share your information only when necessary, including:"],
        bullets: [
          "With service providers who help operate our business (payments, shipping, analytics, customer support)",
          "When required by law or to protect our legal rights",
          "In connection with a business transfer or restructuring",
          "We do not sell your personal information."
        ]
      },
      {
        heading: "User-Generated Content",
        paragraphs: [
          "If you choose to submit reviews, images, or other content publicly, that information may be visible to others. We are not responsible for how third parties use publicly shared content."
        ]
      },
      {
        heading: "Third-Party Links",
        paragraphs: [
          "Our website may contain links to third-party platforms. We are not responsible for the privacy practices or content of those websites and encourage you to review their policies separately."
        ]
      },
      {
        heading: "Data Security & Retention",
        paragraphs: [
          "We take reasonable measures to protect your personal information. However, no system is completely secure. We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law."
        ]
      },
      {
        heading: "Changes to This Policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date."
        ]
      },
      {
        heading: "Contact Us",
        paragraphs: [
          "For any questions or concerns regarding this Privacy Policy, please contact us at:",
          "Email: info@saurene.com"
        ]
      }
    ]
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "This website is operated by Saurene. Throughout the site, the terms \"we\", \"us\" and \"our\" refer to Saurene. By accessing our website, placing an order, or engaging with our services, you agree to be bound by the following Terms & Conditions."
        ]
      },
      {
        heading: "SECTION 2 - Products & Availability",
        paragraphs: [
          "All products displayed on Saurene are subject to availability. As many of our pieces are made to order or produced in limited quantities, slight variations in colour, texture, or finish may occur. These are not considered defects.",
          "We reserve the right to discontinue or modify products without prior notice."
        ]
      },
      {
        heading: "SECTION 1 - ONLINE STORE TERMS",
        paragraphs: [
          "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.",
          "You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).",
          "You must not transmit any worms or viruses or any code of a destructive nature.",
          "A breach or violation of any of the Terms will result in an immediate termination of your Services."
        ]
      },
      {
        heading: "SECTION 3 - GENERAL CONDITIONS",
        paragraphs: [
          "You understand that your content (excluding payment information) may be transferred unencrypted across networks and adapted to technical requirements. Payment information is always encrypted during transfer. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the service without express written permission from us.",
          "Headings are for convenience only and do not affect interpretation."
        ]
      },
      {
        heading: "SECTION 4 - ACCURACY OF BILLING AND ACCOUNT INFORMATION",
        paragraphs: [
          "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.",
          "You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.",
          "For more detail, please review our Returns Policy."
        ]
      },
      {
        heading: "SECTION 5 - USER COMMENTS & SUBMISSIONS",
        paragraphs: [
          "Any feedback, suggestions, or content shared with us may be used by Saurene without obligation of confidentiality or compensation.",
          "You agree your submissions will not violate any third-party rights or contain unlawful or harmful content."
        ]
      },
      {
        heading: "SECTION 5 - INDEMNIFICATION",
        paragraphs: [
          "You agree to indemnify and hold harmless Saurene and its affiliates from any claim arising from your breach of these Terms or violation of law."
        ]
      },
      {
        heading: "SECTION 6 - GOVERNING LAW",
        paragraphs: ["These Terms shall be governed by and interpreted in accordance with the laws of India."]
      },
      {
        heading: "SECTION 6 - CONTACT INFORMATION",
        paragraphs: [
          "For questions regarding these Terms & Conditions, contact us at:",
          "Email: info@saurene.com"
        ]
      }
    ]
  },
  sustainability: {
    title: "Sustainability",
    sections: [
      {
        heading: "SUSTAINABILITY AT SAURENE",
        paragraphs: [
          "At Saurene, sustainability begins at the cutting table.",
          "We create made-to-order pieces, producing only what is needed - reducing excess, waste, and unnecessary stock. Each garment is brought to life by skilled karigars, whose hands shape every seam with time, care, and precision.",
          "While we do not claim perfection, we choose intention wherever possible. Fabric off-cuts from our collections are thoughtfully repurposed into handcrafted hair bows, offered as a complimentary addition with every order - a small gesture to ensure nothing beautiful goes unused.",
          "Saurene believes sustainability is not a label, but a practice - built quietly, stitch by stitch, as we continue to grow."
        ]
      }
    ]
  },
  "our-ethos": {
    title: "Our Ethos",
    image: "/ethos.jpg",
    sections: [
      {
        heading: "OUR ETHO",
        paragraphs: [
          "At Saurene, creation is never rushed.",
          "Our karigars work without pressure, guided instead by intention, focus, and respect for the craft. Each piece is shaped in an environment that values patience, interest, and care - because we believe the energy behind a garment lives on in how it is worn.",
          "Saurene stands for thoughtful work, honest timelines, and positive creation. This approach shapes not only the garment, but the ENERGY IT CARRIES."
        ]
      }
    ]
  },
  "shipping-and-returns": {
    title: "Shipping and Returns",
    sections: [
      {
        heading: "Shipping & Exchange Policy",
        paragraphs: [
          "Thank you for shopping with Saurene.",
          "We take pride in crafting each piece with intention. If, for any reason, you are not entirely satisfied with your purchase, we invite you to review our Exchange Policy below."
        ]
      },
      {
        heading: "Exchange Process",
        paragraphs: [
          "We do not offer refunds or returns.",
          "We offer size exchanges for the same outfit, subject to availability and eligibility.",
          "To be eligible for an exchange, the product must be returned within 3 days from the date of delivery, in the same condition as received, with original tags intact.",
          "You may ship the garment securely in a mailer. Retaining the original cardboard box is optional."
        ]
      },
      {
        heading: "Exchange Approval",
        paragraphs: [
          "Once the product is received, our team will inspect it.",
          "Upon approval, the customer may exchange for the same outfit in a different size, subject to stock availability.",
          "We shall not be responsible for items lost or damaged during return transit. We strongly recommend using a trackable and insured courier service.",
          "Only one exchange is permitted per order."
        ]
      },
      {
        heading: "Sale & Discounted Items",
        paragraphs: ["Products purchased during sales, promotions, or discounted offers are not eligible for exchange."]
      },
      {
        heading: "Self-Shipping Address",
        paragraphs: [
          "In case of an exchange, kindly self-ship the product to:",
          "Saurene",
          "Plot No-815, Basanti Villa Apartment, jharpada canal road near ram leela maidan hanuman temple",
          "PinCode-751006, Bhubaneswar, Odisha, India",
          "Contact Number - +91 9439721131"
        ]
      },
      {
        heading: "Exchange Conditions",
        bullets: [
          "Request within 3 days of delivery",
          "Original tags and receipts must be intact",
          "Item must be unused, unworn, unwashed, and undamaged",
          "Only one exchange per order",
          "Sale/promotional items are not eligible"
        ]
      },
      {
        heading: "Non-Exchangeable Items",
        bullets: [
          "Custom-made products including custom sizes, custom colours, and custom lengths",
          "Items restricted due to hygiene reasons, including undergarments or similar products"
        ]
      },
      {
        heading: "Defective or Damaged Products",
        paragraphs: [
          "Each Saurene piece undergoes strict quality checks before dispatch.",
          "However, in the rare event of a manufacturing defect or damage, please notify us within 48 hours of delivery.",
          "You may contact us at Email: info@saurene.com and WhatsApp: +91 9439721131.",
          "Requests raised beyond this timeframe may not be eligible for resolution."
        ]
      },
      {
        heading: "Orders & Shipping",
        bullets: [
          "Dispatch timeline: 7 - 9 business days",
          "Domestic delivery: 5 - 10 business days after dispatch",
          "Prepaid orders: Free shipping on all orders",
          "Cash on Delivery (COD): Not available",
          "Tracking details usually activate within 24 hours after dispatch",
          "Customs/import duties and taxes are borne by the customer"
        ]
      }
    ]
  },
  "contact-us": {
    title: "Contact Us",
    sections: [
      {
        heading: "Support",
        paragraphs: [
          "For order support, exchanges, and general queries, contact us using the details below."
        ],
        bullets: [
          "Email: info@saurene.com",
          "WhatsApp: +91 9439721131",
          "Phone: +91 9439721131",
          "Social: Instagram"
        ]
      }
    ]
  },
  "size-guide": {
    title: "Size Guide",
    sections: [
      {
        heading: "Sizing",
        paragraphs: [
          "Please refer to the size chart shown on each product page. If you need fit guidance before ordering, contact us at info@saurene.com."
        ]
      }
    ]
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  const content = infoContent[slug] || {
    title: "Information",
    sections: [{ heading: "Details", paragraphs: ["Information will be updated soon."] }]
  };

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">{content.title}</h1>
      <div className="mt-6 max-w-3xl rounded-3xl bg-white p-6 leading-7 text-brand-charcoal/80 shadow-sm sm:p-8 sm:leading-8">
        {content.image ? (
          <img
            src={content.image}
            alt={content.title}
            className="mb-6 w-full rounded-2xl object-cover"
          />
        ) : null}
        {content.sections.map((section) => (
          <section key={section.heading} className="mb-6 last:mb-0">
            <h2 className="font-heading text-2xl text-brand-wine">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm sm:text-base">
                {paragraph}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
