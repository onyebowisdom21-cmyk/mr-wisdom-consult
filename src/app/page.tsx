import Link from "next/link";

const areas = [
  {
    number: "01",
    title: "Technology & digital strategy",
    description: "Turn complex technology decisions into practical plans, digital solutions and measurable progress.",
    href: "/services",
    label: "Explore services",
  },
  {
    number: "02",
    title: "Media & communications",
    description: "Build a clearer voice, stronger content and more connected audiences across digital channels.",
    href: "/news",
    label: "Read the latest",
  },
  {
    number: "03",
    title: "Business advisory",
    description: "Find focused guidance for business planning, operations, growth and new opportunities.",
    href: "/services",
    label: "Work with us",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div className="eyebrow">Technology · Media · Business</div>
          <h1>Clarity for your next big move.</h1>
          <p>
            Practical consultancy, useful digital resources and carefully curated
            opportunities to help people and businesses move forward.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/contact">Start a conversation <span aria-hidden="true">→</span></Link>
            <Link className="button secondary" href="/opportunities">Explore opportunities</Link>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">What we do</div>
              <h2>Ideas are only the beginning.</h2>
              <p className="section-intro">
                We bring technology, media and business thinking together to make
                your next step clearer and more achievable.
              </p>
            </div>
            <Link className="text-link" href="/about">Meet the consultancy →</Link>
          </div>
          <div className="card-grid">
            {areas.map((area) => (
              <article className="card" key={area.number}>
                <div className="card-meta">{area.number}</div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <Link className="text-link" href={area.href}>{area.label} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-band">
            <div className="eyebrow">A useful place to start</div>
            <h2>Find the service, resource or opportunity that fits your next step.</h2>
            <p className="section-intro">
              Browse our current catalog and opportunity listings, or tell us what
              you are working toward and we will help you find a direction.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/services">View services</Link>
              <Link className="button light" href="/opportunities">Browse opportunities</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
