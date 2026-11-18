export type ISODate = string;

export interface Service {
  id: string; title: string; slug: string;
  category: string;
  shortDescription: string; fullDetails: string;
  pricingModel: "Fixed" | "Custom Quote" | "Hourly";
  price?: number | null; currency?: string | null;
  deliverables: string[]; ctaUrl?: string | null;
  isActive: boolean; updatedAt: ISODate;
}

export interface Product {
  id: string; title: string; slug: string;
  productType: string; summary: string; description: string;
  price: number; currency?: string | null;
  coverImage?: string | null; purchaseOrAccessUrl?: string | null;
  features: string[]; isAvailable: boolean; updatedAt: ISODate;
}

export interface Article {
  id: string; title: string; slug: string;
  category: "News" | "Announcement";
  summary: string; featuredImage?: string | null;
  content: string; author: string; tags: string[];
  publishedDate: ISODate; externalReferenceUrl?: string | null;
  isPublished: boolean; updatedAt: ISODate;
}

export interface Scholarship {
  id: string; title: string; slug: string;
  institution: string; country: string;
  fundingType: "Full" | "Partial"; value?: string | null;
  deadline?: ISODate | null; eligibilitySummary: string;
  requirements: string; applicationUrl: string;
  isFeatured: boolean; isPublished: boolean; updatedAt: ISODate;
}

export interface Grant {
  id: string; title: string; slug: string;
  fundingOrganization: string; focalArea: string;
  grantAmount?: string | null; applicationDeadline?: ISODate | null;
  eligibility: string; applicationUrl: string;
  isPublished: boolean; updatedAt: ISODate;
}

export interface Job {
  id: string; title: string; slug: string;
  organization: string; location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  jobType: "Full-time" | "Contract" | "Internship";
  salaryRange?: string | null; description: string;
  deadline?: ISODate | null; applicationUrl: string;
  isPublished: boolean; updatedAt: ISODate;
}

export interface Empowerment {
  id: string; title: string; slug: string;
  organizer: string; programType: string; targetAudience: string;
  benefits: string; deadline?: ISODate | null; registrationUrl: string;
  isPublished: boolean; updatedAt: ISODate;
}

export interface ContentMap {
  services: Service; products: Product; articles: Article;
  scholarships: Scholarship; grants: Grant; jobs: Job; empowerment: Empowerment;
}
export type ContentKind = keyof ContentMap;

export const CONTENT_ROUTES: Record<ContentKind, string> = {
  services: "/services",
  products: "/products",
  articles: "/news", // announcements resolved per-row via routeFor()
  scholarships: "/opportunities/scholarships",
  grants: "/opportunities/grants",
  jobs: "/opportunities/jobs",
  empowerment: "/opportunities/empowerment",
};

export function routeFor(kind: ContentKind, slug: string, category?: string): string {
  if (kind === "articles" && category === "Announcement") return `/announcements/${slug}`;
  return `${CONTENT_ROUTES[kind]}/${slug}`;
}

export const CONTENT_KINDS = Object.keys(CONTENT_ROUTES) as ContentKind[];

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
