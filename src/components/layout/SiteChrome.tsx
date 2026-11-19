import Image from "next/image";
import Link from "next/link";
import { publicEnv } from "@/lib/env";
import { getCurrentYear } from "@/lib/time";

const links: [string, string][] = [
  ["Services", "/services"],
  ["Products", "/products"],
  ["News", "/news"],
  ["Opportunities", "/opportunities"],
  ["About", "/about"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Mr Wisdom Consult home">
          <Image
            alt=""
            className="brand-logo"
            height={56}
            priority
            src="/mr-wisdom-logo.jpeg"
            width={56}
          />
          <span>
            Mr Wisdom
            <small>Tech · Media · Business</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link className="button" href="/contact">Let&apos;s talk</Link>
        </nav>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const year = await getCurrentYear();
  const email = publicEnv("NEXT_PUBLIC_CONTACT_EMAIL");
  const whatsapp = publicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER")?.replace(/\D/g, "");
  const callNumber = publicEnv("NEXT_PUBLIC_CALL_NUMBER")?.replace(/\D/g, "");
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <Link className="brand" href="/">
              <Image
                alt=""
                className="brand-logo"
                height={64}
                src="/mr-wisdom-logo.jpeg"
                width={64}
              />
              <span>Mr Wisdom<small>Tech · Media · Business</small></span>
            </Link>
            <p>Ideas into practical technology, media and business outcomes.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <div className="footer-links">
              <Link href="/services">Consulting services</Link>
              <Link href="/products">Products & resources</Link>
              <Link href="/opportunities">Global opportunities</Link>
            </div>
          </div>
          <div>
            <h3>Get in touch</h3>
            <div className="footer-links">
              <Link href="/contact">Contact & inquiries</Link>
              {email && <a href={`mailto:${email}`}>{email}</a>}
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} rel="noopener noreferrer" target="_blank">WhatsApp: +{whatsapp} ↗</a>}
              {callNumber && <a href={`tel:+${callNumber}`}>Call: +{callNumber}</a>}
              <a href="https://whatsapp.com/channel/0029Va9ZoIj7dmeSGEgQRR0f" rel="noopener noreferrer" target="_blank">WhatsApp channel ↗</a>
              <Link href="/about">About the consultancy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {year} Mr Wisdom Tech Media and Business Consult.
        </div>
      </div>
    </footer>
  );
}
