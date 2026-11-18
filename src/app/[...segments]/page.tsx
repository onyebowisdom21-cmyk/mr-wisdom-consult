import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogGrid, type CatalogCard } from "@/components/features/CatalogGrid";
import { ContactForm } from "@/components/features/ContactForm";
import { RichTextRenderer } from "@/components/features/RichTextRenderer";
import { getBySlug, getList } from "@/lib/data";
import { publicEnv, siteBaseUrl } from "@/lib/env";
import { getUtcDate } from "@/lib/time";
import {
  routeFor,
  type ContentKind,
  type ContentMap,
} from "@/types/platform";

type RouteParams = { segments: string[] };
type Item = ContentMap[ContentKind];

const opportunityKinds = ["scholarships", "grants", "jobs", "empowerment"] as const;
const kindByRoute: Record<string, ContentKind> = {
  services: "services",
  products: "products",
  news: "articles",
  announcements: "articles",
  scholarships: "scholarships",
  grants: "grants",
  jobs: "jobs",
  empowerment: "empowerment",
};

function kindFor(segments: string[]): ContentKind | null {
  const first = segments[0];
  if (!first) return null;
  if (first === "opportunities") {
    const second = segments[1];
    return second ? kindByRoute[second] ?? null : null;
  }
  return kindByRoute[first] ?? null;
}

function isAnnouncement(item: Item): boolean {
  return "category" in item && item.category === "Announcement";
}

function summaryFor(item: Item): string {
  if ("shortDescription" in item) return item.shortDescription;
  if ("summary" in item) return item.summary;
  if ("eligibilitySummary" in item) return item.eligibilitySummary;
  if ("focalArea" in item) return item.focalArea;
  if ("description" in item) return item.description;
  if ("benefits" in item) return item.benefits;
  return "";
}

function categoryFor(item: Item): string {
  if ("category" in item) return item.category;
  if ("productType" in item) return item.productType;
  if ("institution" in item) return `${item.institution} · ${item.country}`;
  if ("fundingOrganization" in item) return `${item.fundingOrganization} · ${item.focalArea}`;
  if ("organization" in item) return `${item.organization} · ${item.location}`;
  if ("organizer" in item) return `${item.organizer} · ${item.programType}`;
  return "Resource";
}

function detailFor(item: Item): string | undefined {
  if ("deadline" in item && item.deadline) return `Deadline: ${item.deadline}`;
  if ("applicationDeadline" in item && item.applicationDeadline) return `Deadline: ${item.applicationDeadline}`;
  if ("price" in item && item.price != null) return `${item.currency ?? "NGN"} ${item.price.toLocaleString()}`;
  if ("pricingModel" in item) return item.pricingModel;
  return undefined;
}

function toCard(kind: ContentKind, item: Item): CatalogCard {
  const image = "featuredImage" in item ? item.featuredImage : "coverImage" in item ? item.coverImage : null;
  return {
    title: item.title,
    summary: summaryFor(item),
    category: categoryFor(item),
    detail: detailFor(item),
    image: image && isAllowedImage(image) ? image : undefined,
    href: routeFor(kind, item.slug, kind === "articles" && isAnnouncement(item) ? "Announcement" : undefined),
  };
}

function isAllowedImage(value: string): boolean {
  try {
    const url = new URL(value);
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "";
    return url.protocol === "https:" && (url.hostname === "images.unsplash.com" || url.hostname === supabaseHost);
  } catch {
    return false;
  }
}

async function loadCards(kind: ContentKind, category?: "News" | "Announcement"): Promise<CatalogCard[]> {
  const items = await getList(kind, { limit: 100 });
  return items
    .filter((item) => !category || ("category" in item && item.category === category))
    .map((item) => toCard(kind, item));
}

function pageHeading(kind: ContentKind): { title: string; description: string } {
  const headings: Record<ContentKind, { title: string; description: string }> = {
    services: { title: "Consulting services", description: "Focused technology, media and business support to help you plan, solve and grow." },
    products: { title: "Products & resources", description: "Explore practical digital products, tools and learning resources from the consultancy." },
    articles: { title: "News & insights", description: "Updates, announcements and useful perspectives from Mr Wisdom Consult." },
    scholarships: { title: "Scholarships", description: "Funding opportunities and scholarship listings to support your next step." },
    grants: { title: "Grants", description: "Explore grant opportunities and the information you need to apply." },
    jobs: { title: "Jobs", description: "Discover career opportunities from organizations looking for new talent." },
    empowerment: { title: "Empowerment programs", description: "Programs, initiatives and resources designed to help people build capacity." },
  };
  return headings[kind];
}

async function ListingPage({ kind, category }: { kind: ContentKind; category?: "News" | "Announcement" }) {
  const cards = await loadCards(kind, category);
  const heading = category === "Announcement"
    ? { title: "Announcements", description: "Official notices and updates from Mr Wisdom Tech Media and Business Consult." }
    : pageHeading(kind);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Explore the catalog</div>
          <h1>{heading.title}</h1>
          <p>{heading.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {cards.length ? <CatalogGrid items={cards} /> : <p className="status">There are no published items here yet. Please check back soon.</p>}
        </div>
      </section>
    </>
  );
}

function safeActionUrl(value: string | null | undefined): { href: string; external: boolean } | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return { href: value, external: false };
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return { href: url.toString(), external: true };
  } catch {
    return null;
  }
  return null;
}

function actionFor(item: Item): { label: string; url: string | null | undefined } | null {
  if ("ctaUrl" in item) return { label: "Ask about this service", url: item.ctaUrl || "/contact" };
  if ("purchaseOrAccessUrl" in item) return { label: "Get this product", url: item.purchaseOrAccessUrl };
  if ("applicationUrl" in item) {
    return { label: "Visit the official application page", url: item.applicationUrl };
  }
  if ("registrationUrl" in item) return { label: "Visit the registration page", url: item.registrationUrl };
  return null;
}

function deadlineFor(item: Item): string | null {
  if ("deadline" in item) return item.deadline ?? null;
  if ("applicationDeadline" in item) return item.applicationDeadline ?? null;
  return null;
}

function structuredData(kind: ContentKind, item: Item): Record<string, unknown> {
  const category = "category" in item ? item.category : undefined;
  const path = routeFor(kind, item.slug, category);
  const absoluteUrl = new URL(path, siteBaseUrl()).toString();
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": kind === "services" ? "Service"
      : kind === "products" ? "Product"
        : kind === "articles" ? "NewsArticle"
          : kind === "jobs" ? "JobPosting"
            : kind === "grants" ? "MonetaryGrant"
              : kind === "scholarships" ? "EducationalOccupationalProgram"
                : "Event",
    name: item.title,
    description: summaryFor(item),
    url: absoluteUrl,
    dateModified: item.updatedAt,
  };
  if ("price" in item && item.price != null) {
    data.offers = {
      "@type": "Offer",
      price: item.price,
      priceCurrency: item.currency ?? "NGN",
    };
  }
  if ("applicationUrl" in item) {
    const application = safeActionUrl(item.applicationUrl);
    if (application?.external) data.url = application.href;
  }
  if ("deadline" in item && item.deadline) data.endDate = item.deadline;
  if ("applicationDeadline" in item && item.applicationDeadline) data.endDate = item.applicationDeadline;
  if ("organization" in item) {
    data.hiringOrganization = { "@type": "Organization", name: item.organization };
    data.employmentType = item.jobType;
  }
  return data;
}

async function ActionCard({ kind, item }: { kind: ContentKind; item: Item }) {
  const action = actionFor(item);
  if (!action) return null;
  const target = safeActionUrl(action.url);
  const deadline = deadlineFor(item);
  const today = await getUtcDate();
  const expired = deadline ? deadline < today : false;
  const facts: string[] = [];
  if ("institution" in item) facts.push(`${item.institution} · ${item.country} · ${item.fundingType} funding`);
  if ("value" in item && item.value) facts.push(`Funding value: ${item.value}`);
  if ("fundingOrganization" in item && item.grantAmount) facts.push(`${item.fundingOrganization} · ${item.grantAmount}`);
  if ("organization" in item) facts.push(`${item.organization} · ${item.location} · ${item.workMode} · ${item.jobType}`);
  if ("salaryRange" in item && item.salaryRange) facts.push(`Salary: ${item.salaryRange}`);
  if ("organizer" in item) facts.push(`${item.organizer} · ${item.programType}`);
  return (
    <aside className="action-card">
      <h2>Next step</h2>
      {facts.map((fact) => <p key={fact}>{fact}</p>)}
      {deadline && <p><strong>Deadline:</strong> {deadline}{expired ? " · Expired" : ""}</p>}
      {"price" in item && item.price != null && <p><strong>Price:</strong> {item.currency ?? "NGN"} {item.price.toLocaleString()}</p>}
      {"pricingModel" in item && <p><strong>Pricing:</strong> {item.pricingModel}</p>}
      {expired && <p className="status error">This opportunity deadline has passed.</p>}
      {target && (!expired || !deadline) && (
        target.external
          ? <a className="button" href={target.href} rel="noopener noreferrer" target="_blank">{action.label} ↗</a>
          : <Link className="button" href={target.href}>{action.label}</Link>
      )}
      {!target && <Link className="button" href="/contact">Contact us about this</Link>}
      {kind === "articles" && "externalReferenceUrl" in item && safeActionUrl(item.externalReferenceUrl)?.external && (
        <p><a href={item.externalReferenceUrl ?? undefined} rel="noopener noreferrer" target="_blank">Original source ↗</a></p>
      )}
    </aside>
  );
}

async function DetailPage({
  kind,
  slug,
  expectedCategory,
}: {
  kind: ContentKind;
  slug: string;
  expectedCategory?: "News" | "Announcement";
}) {
  const item = await getBySlug(kind, slug);
  if (!item || (expectedCategory && (!("category" in item) || item.category !== expectedCategory))) {
    notFound();
  }
  const jsonLd = JSON.stringify(structuredData(kind, item)).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">{categoryFor(item)}</div>
          <h1>{item.title}</h1>
          <p>{summaryFor(item)}</p>
        </div>
      </section>
      <section className="section">
        <div className="container content-layout">
          <article className="content-body">
            <RichTextRenderer content={
              "fullDetails" in item ? item.fullDetails
                : "content" in item ? item.content
                  : "requirements" in item ? item.requirements
                    : "eligibility" in item ? item.eligibility
                      : "description" in item ? item.description
                        : "benefits" in item ? item.benefits
                          : summaryFor(item)
            } />
            {"deliverables" in item && item.deliverables.length > 0 && (
              <>
                <h2>What&apos;s included</h2>
                <ul>{item.deliverables.map((value) => <li key={value}>{value}</li>)}</ul>
              </>
            )}
            {"features" in item && item.features.length > 0 && (
              <>
                <h2>Features</h2>
                <ul>{item.features.map((value) => <li key={value}>{value}</li>)}</ul>
              </>
            )}
            {"tags" in item && item.tags.length > 0 && <p><strong>Topics:</strong> {item.tags.join(" · ")}</p>}
          </article>
          <ActionCard item={item} kind={kind} />
        </div>
      </section>
    </>
  );
}

async function OpportunityHub() {
  const groups = await Promise.all(opportunityKinds.map((kind) => loadCards(kind)));
  const cards = groups.flat();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Find your next step</div>
          <h1>Opportunities</h1>
          <p>Browse scholarships, grants, jobs and empowerment programs in one place.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="admin-nav">
            {opportunityKinds.map((kind) => <Link className="button light" href={`/opportunities/${kind}`} key={kind}>{pageHeading(kind).title}</Link>)}
          </div>
          {cards.length ? <CatalogGrid items={cards} /> : <p className="status">There are no published opportunities yet. Please check back soon.</p>}
        </div>
      </section>
    </>
  );
}

async function renderRoute(segments: string[]) {
  const first = segments[0];
  if (!first) notFound();
  if (segments.length === 1 && first === "about") {
    return (
      <>
        <section className="page-hero"><div className="container"><div className="eyebrow">About us</div><h1>Technology, media and business—with purpose.</h1><p>Mr Wisdom Tech Media and Business Consult helps people and organizations turn ideas into practical action.</p></div></section>
        <section className="section"><div className="container"><div className="content-body">
          <h2>Clear thinking. Useful outcomes.</h2>
          <p>We bring a multidisciplinary perspective to technology, communications and business challenges. Our goal is to make the options clearer and the next step more achievable.</p>
          <p>Explore our <Link href="/services">consulting services</Link>, browse <Link href="/products">products and resources</Link>, or find a new opportunity in our <Link href="/opportunities">opportunity hub</Link>.</p>
          <Link className="button" href="/contact">Tell us what you&apos;re working on</Link>
        </div></div></section>
      </>
    );
  }

  if (segments.length === 1 && first === "contact") {
    const whatsapp = publicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER")?.replace(/\D/g, "");
    const callNumber = publicEnv("NEXT_PUBLIC_CALL_NUMBER")?.replace(/\D/g, "");
    return (
      <>
        <section className="page-hero"><div className="container"><div className="eyebrow">Get in touch</div><h1>Let&apos;s make your next step clearer.</h1><p>Tell us about your goals or challenge. We&apos;ll follow up using the contact details you provide.</p></div></section>
        <section className="section"><div className="container content-layout">
          <div><h2>Start a conversation</h2><p className="section-intro">Share a few details about what you need, and the consultancy team will get back to you.</p>
            <div className="footer-links">
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} rel="noopener noreferrer" target="_blank">WhatsApp: +{whatsapp} ↗</a>}
              {callNumber && <a href={`tel:+${callNumber}`}>Call: +{callNumber}</a>}
            </div>
            <ContactForm />
          </div>
          <aside className="action-card"><h2>Not sure where to start?</h2><p>Ask Wisdom AI Advisor a question or browse current services and opportunities.</p><p><Link className="text-link" href="/services">See our services →</Link></p><p><Link className="text-link" href="/opportunities">Explore opportunities →</Link></p></aside>
        </div></section>
      </>
    );
  }

  if (segments.length === 1 && ["services", "products", "news", "announcements"].includes(first)) {
    const kind = kindFor(segments) as ContentKind;
    return <ListingPage category={first === "announcements" ? "Announcement" : first === "news" ? "News" : undefined} kind={kind} />;
  }
  if (segments.length === 1 && first === "opportunities") return <OpportunityHub />;

  const kind = kindFor(segments);
  if (!kind) notFound();
  const second = segments[1];
  const third = segments[2];
  if (first === "opportunities" && segments.length === 2) {
    return <ListingPage kind={kind} />;
  }
  if (segments.length === 2 && second) {
    const expectedCategory = first === "announcements" ? "Announcement" : first === "news" ? "News" : undefined;
    return <DetailPage expectedCategory={expectedCategory} kind={kind} slug={second} />;
  }
  if (first === "opportunities" && segments.length === 3 && second && third) {
    return <DetailPage kind={kind} slug={third} />;
  }
  notFound();
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { segments } = await params;
  const kind = kindFor(segments);
  const slug = segments.at(-1);
  if (!kind || segments.length < 2 || !slug) return {};
  const item = await getBySlug(kind, slug);
  if (!item) return {};
  const category = "category" in item ? item.category : undefined;
  const canonical = routeFor(kind, item.slug, category);
  const image = "featuredImage" in item ? item.featuredImage : "coverImage" in item ? item.coverImage : null;
  return {
    title: item.title,
    description: summaryFor(item).slice(0, 160),
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description: summaryFor(item).slice(0, 160),
      type: "article",
      url: canonical,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: item.title, description: summaryFor(item).slice(0, 160), images: image ? [image] : undefined },
  };
}

export default async function PublicRoute({ params }: { params: Promise<RouteParams> }) {
  const { segments } = await params;
  return renderRoute(segments);
}
