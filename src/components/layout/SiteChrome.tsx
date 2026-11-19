import Image from "next/image";
import Link from "next/link";
import { publicEnv } from "@/lib/env";
import { getCurrentYear } from "@/lib/time";

const links: [string, string][] = [
  ["Marketplace", "/marketplace"],
  ["Services", "/services"],
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
          <Link className="nav-home" href="/" aria-label="Home" title="Home">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9v12h14V9M9 21v-7h6v7" />
            </svg>
          </Link>
          {links.map(([label, href]) => (
            <Link
              className={href === "/marketplace" ? "nav-marketplace" : "nav-secondary"}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
          <form action="/marketplace" className="header-search" role="search">
            <label className="sr-only" htmlFor="header-listing-search">Search marketplace listings</label>
            <input
              autoComplete="off"
              id="header-listing-search"
              name="q"
              placeholder="Search listings…"
              type="search"
            />
            <button type="submit">Search</button>
          </form>
          <Link className="button header-booking" href="/services">Book Me</Link>
          <Link className="button header-contact" href="/contact">Let&apos;s talk</Link>
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
              <Link href="/services">Services &amp; Book Me</Link>
              <Link href="/products">Products & resources</Link>
              <Link href="/news">News &amp; insights</Link>
              <Link href="/announcements">Announcements</Link>
              <Link href="/opportunities">Global opportunities</Link>
              <Link href="/about">About the consultancy</Link>
            </div>
          </div>
          <div>
            <h3>Marketplace</h3>
            <div className="footer-links">
              <Link href="/marketplace">View listings</Link>
              <Link href="/marketplace/upload">Post goods or a service</Link>
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
