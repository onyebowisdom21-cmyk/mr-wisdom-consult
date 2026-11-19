import Image from "next/image";
import Link from "next/link";
import { getList } from "@/lib/data";
import { publicEnv } from "@/lib/env";

const capabilities = [
  {
    number: "01",
    title: "Technology & product development",
    description: "Practical websites, digital tools, and technology guidance built around real needs.",
    href: "/services",
    action: "Explore technology services",
  },
  {
    number: "02",
    title: "Digital skills & hub training",
    description: "Hands-on learning that helps individuals and teams build useful digital confidence.",
    href: "/services",
    action: "Explore training",
  },
  {
    number: "03",
    title: "Media & communications",
    description: "Clear storytelling, content, and media support to help your message reach people.",
    href: "/news",
    action: "Read our updates",
  },
  {
    number: "04",
    title: "Business consulting",
    description: "Focused support for planning, operations, growth, and your next business decision.",
    href: "/services",
    action: "See how we can help",
  },
  {
    number: "05",
    title: "Opportunities & empowerment",
    description: "Jobs, scholarships, grants, and programs gathered to support your next step.",
    href: "/opportunities",
    action: "Explore opportunities",
  },
];

const gallery = [
  {
    src: "/mr-wisdom-office.png",
    title: "Technology meets business",
    alt: "Mr Wisdom working in a modern office",
    width: 768,
    height: 768,
  },
  {
    src: "/training-classroom.png",
    title: "Practical digital learning",
    alt: "A trainer leading a digital skills session in a classroom",
    width: 768,
    height: 768,
  },
  {
    src: "/training-audience.png",
    title: "Learning in community",
    alt: "Attendees gathered at a community learning event",
    width: 768,
    height: 768,
  },
  {
    src: "/mr-wisdom-home-portrait.jpeg",
    title: "Meet your consulting partner",
    alt: "Mr Wisdom's technology, media, and business consulting portrait",
    width: 716,
    height: 1600,
  },
];

function priceLabel(price: number | null | undefined, currency: string | null | undefined): string {
  if (price == null) return "Ask for a quote";
  const formatted = new Intl.NumberFormat("en-NG").format(price);
  return currency && currency !== "NGN" ? `${currency} ${formatted}` : `₦${formatted}`;
}

export default async function Home() {
  const services = (await getList("services", { limit: 12 }))
    .filter((service) => service.isActive)
    .slice(0, 4);
  const whatsapp = publicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER")?.replace(/\D/g, "");

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-value-card">
            <div className="home-hero-copy">
              <p className="eyebrow">Tech · Media · Business Consult</p>
              <h1>Clear thinking. Useful outcomes.</h1>
              <p className="home-hero-intro">
                Practical technology, media, and business support to help you
                take your next step.
              </p>
              <div className="hero-actions">
                <Link className="button home-hero-primary" href="/services">
                  Explore services <span aria-hidden="true">→</span>
                </Link>
                <Link className="button home-hero-secondary" href="/contact">
                  Talk with us
                </Link>
              </div>
              <p className="home-hero-location">Owerri, Nigeria · Nationwide service</p>
            </div>
          </div>

          <aside className="home-marketplace-card" aria-labelledby="home-marketplace-title">
            <p className="home-marketplace-label">Community marketplace</p>
            <h2 id="home-marketplace-title">MARKETPLACE</h2>
            <p className="home-marketplace-copy">
              Buy, sell, or book a trusted service in one place.
            </p>
            <div className="home-marketplace-actions">
              <Link className="button marketplace-action-primary" href="/marketplace">
                View listings <span aria-hidden="true">→</span>
              </Link>
              <Link className="button marketplace-action-secondary" href="/marketplace/upload">
                Post goods
              </Link>
              <Link className="button marketplace-action-secondary" href="/services">
                Book Me
              </Link>
            </div>
            <p className="home-marketplace-note">Owerri-based · Serving Nigeria nationwide</p>
          </aside>
        </div>
      </section>

      <section className="section home-capabilities">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">What we do</p>
              <h2>One practical partner for your next step.</h2>
              <p className="section-intro">
                Technology, training, media, and business thinking—connected to the
                opportunities that help people make progress.
              </p>
            </div>
            <Link className="text-link" href="/about">Meet the consultancy →</Link>
          </div>
          <div className="card-grid home-capability-grid">
            {capabilities.map((item) => (
              <article className="card home-capability-card" key={item.number}>
                <span className="card-meta">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className="text-link" href={item.href}>{item.action} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-featured-services">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Featured services</p>
              <h2>Get expert help when you need it.</h2>
              <p className="section-intro">
                Browse services, review what&apos;s included, and use the booking link on each service.
              </p>
            </div>
            <Link className="text-link" href="/services">View all services →</Link>
          </div>
          {services.length ? (
            <div className="home-service-grid">
              {services.map((service) => (
                <article className="home-service-card" key={service.id}>
                  <p className="card-meta">{service.category}</p>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                  <div className="home-service-footer">
                    <strong>{priceLabel(service.price, service.currency)}</strong>
                    <Link className="text-link" href={`/services/${service.slug}`}>View &amp; book →</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              <p>Service packages are being updated. You can still browse all services or tell us what you need.</p>
              <div className="home-empty-actions">
                <Link className="button" href="/services">Browse services</Link>
                <Link className="button secondary" href="/contact">Ask a question</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="home-trust">
        <div className="container">
          <div className="home-trust-heading">
            <p className="eyebrow">A straightforward way to work together</p>
            <h2>From first question to useful outcome.</h2>
          </div>
          <div className="home-steps-grid">
            <article className="home-step">
              <span>01</span>
              <h3>Tell us what you need</h3>
              <p>Share your goal, challenge, or idea through the contact form or WhatsApp.</p>
            </article>
            <article className="home-step">
              <span>02</span>
              <h3>Agree on a clear next step</h3>
              <p>We&apos;ll discuss practical options, timing, and the right service for you.</p>
            </article>
            <article className="home-step">
              <span>03</span>
              <h3>Move forward together</h3>
              <p>Get focused support from Owerri, with services available to clients nationwide.</p>
            </article>
          </div>
          <div className="home-trust-strip">
            <p><strong>Local roots:</strong> Owerri, Imo State</p>
            <p><strong>Service area:</strong> Across Nigeria</p>
            <p><strong>Clear contact:</strong> <Link href="/contact">Contact the consultancy</Link></p>
          </div>
        </div>
      </section>

      <section className="home-gallery">
        <div className="container">
          <div className="home-gallery-heading">
            <p className="eyebrow">Our work in pictures</p>
            <h2>People, ideas, and progress.</h2>
            <p>Take a look at the learning spaces and community behind our work.</p>
          </div>
          <div className="home-gallery-grid">
            {gallery.map((image) => (
              <figure className="home-gallery-card" key={image.src}>
                <div className="home-gallery-frame">
                  <Image
                    alt={image.alt}
                    className="home-gallery-image"
                    height={image.height}
                    loading="lazy"
                    sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 30vw"
                    src={image.src}
                    width={image.width}
                  />
                </div>
                <figcaption>{image.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="home-opportunities">
        <div className="container home-opportunities-grid">
          <div className="home-opportunities-copy">
            <p className="eyebrow">A useful place to start</p>
            <h2>Find the opportunity that fits your next move.</h2>
            <p>
              Explore jobs, scholarships, grants, and empowerment programs
              gathered to help you take a confident next step.
            </p>
            <Link className="button home-opportunities-button" href="/opportunities">
              Explore opportunities <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Image
            alt="New career opportunities, including jobs, fellowships, mentorship, and training"
            className="home-opportunities-image"
            height={512}
            loading="lazy"
            sizes="(max-width: 800px) 100vw, 44vw"
            src="/career-opportunities.jpeg"
            width={512}
          />
        </div>
      </section>

      <section className="home-faq">
        <div className="container home-faq-layout">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2>Questions, answered.</h2>
            <p>Start with the details that matter. If you need more, we&apos;re easy to reach.</p>
            <Link className="text-link" href="/contact">Ask us directly →</Link>
          </div>
          <div className="home-faq-list">
            <details>
              <summary>How do I post goods or a service?</summary>
              <p>Choose “Post goods” in the Marketplace, add your listing details, and submit it for display.</p>
            </details>
            <details>
              <summary>How do I book a service?</summary>
              <p>Browse services, open the one you need, then use its booking link or contact the consultancy.</p>
            </details>
            <details>
              <summary>Where do you work?</summary>
              <p>We are based in Owerri, Imo State, and work with clients and communities across Nigeria.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="home-contact">
        <div className="container home-contact-inner">
          <div>
            <p className="eyebrow">Your next chapter</p>
            <h2>Let&apos;s make it happen.</h2>
            <p>Tell us what you&apos;re working toward. We&apos;ll help you find a practical way forward.</p>
          </div>
          <div className="home-contact-actions">
            <Link className="button home-contact-button" href="/contact">
              Start a conversation <span aria-hidden="true">→</span>
            </Link>
            {whatsapp && (
              <a className="button home-contact-whatsapp" href={`https://wa.me/${whatsapp}`} rel="noopener noreferrer" target="_blank">
                WhatsApp us <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
