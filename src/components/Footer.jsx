import { Link } from "react-router-dom";

const quickLinks = [
  "privacy-policy",
  "sustainability",
  "our-ethos",
  "terms-and-conditions",
  "shipping-and-returns",
  "contact-us",
  "size-guide"
];

export default function Footer() {
  return (
    <footer className="mt-14 bg-brand-wine text-brand-ivory sm:mt-20">
      <div className="container-pad grid gap-8 py-10 sm:gap-10 sm:py-14 md:grid-cols-3">
        <div>
          <img src="/logo-saurene.png" alt="Saurene" className="footer-logo h-16 w-auto sm:h-20" />
          <p className="mt-4 text-sm leading-7 text-brand-ivory/85">
            Saurene is a truly homegrown fashion brand built with intention, patience, and
            care. Each piece is designed to feel calm yet confident and elegant without being
            loud.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Quick Links</h4>
          <div className="mt-4 grid gap-2 text-sm">
            {quickLinks.map((slug) => (
              <Link key={slug} to={`/info/${slug}`} className="hover:underline">
                {slug.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Contact</h4>
          <p className="mt-4 text-sm">Phone: +91 9439721131</p>
          <p className="text-sm">WhatsApp: +91 9439721131</p>
          <p className="text-sm">Email: info@saurene.com</p>
          <p className="mt-5 text-sm">Follow us</p>
          <div className="mt-2 flex gap-4 text-sm">
            <a
              href="https://www.instagram.com/saurene.official?igsh=MmZ1eTFpaHhhbmc5"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-ivory/50 text-brand-ivory transition hover:bg-brand-ivory/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-ivory/20">
        <div className="container-pad py-4 text-center text-xs text-brand-ivory/80 sm:text-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p>© 2026 Saurene. All rights reserved.</p>
            <div className="text-center sm:text-right">
              <p>
                Built by{" "}
                <a
                  href="https://pixscripti.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-ivory underline underline-offset-4 transition hover:text-white"
                >
                  PixScripti Technologies
                </a>
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-ivory/70 sm:text-xs">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m12 2 1.6 4.2L18 8l-4.4 1.8L12 14l-1.6-4.2L6 8l4.4-1.8Z" />
                  <path d="M5 16.5 6 19l2.5 1L6 21l-1 2.5L4 21l-2.5-1L4 19Z" />
                  <path d="M19 15.5 19.7 17l1.8.7-1.8.7L19 20l-.7-1.6-1.8-.7 1.8-.7Z" />
                </svg>
                Crafted with human creativity and AI innovation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
