import { z } from "zod";

const slug = z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
const url = z.string().url().max(2048).refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "https:" || protocol === "http:";
}, "Use an HTTP or HTTPS URL");
const optUrl = z.union([url, z.literal(""), z.null()]).optional().transform((v) => v || null);
const optDate = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }),
  z.literal(""),
  z.null(),
]).optional().transform((v) => v || null);
const optText = z.string().max(500).optional().nullable().transform((v) => v || null);
const list = z.array(z.string().min(1).max(300)).max(40).default([]);
const longText = z.string().max(100_000).default("");

export const schemas = {
  services: z.object({
    title: z.string().min(2).max(200), slug,
    category: z.string().min(2).max(100),
    shortDescription: z.string().min(10).max(500), fullDetails: longText,
    pricingModel: z.enum(["Fixed", "Custom Quote", "Hourly"]),
    price: z.union([z.literal(""), z.null(), z.coerce.number().nonnegative()])
      .optional()
      .transform((value) => value === "" || value == null ? null : value),
    currency: z.string().length(3).default("NGN"),
    deliverables: list, ctaUrl: optUrl, isActive: z.coerce.boolean().default(true),
  }),
  products: z.object({
    title: z.string().min(2).max(200), slug,
    productType: z.string().min(2).max(100),
    summary: z.string().min(10).max(500), description: longText,
    price: z.coerce.number().nonnegative(), currency: z.string().length(3).default("NGN"),
    coverImage: optUrl, purchaseOrAccessUrl: optUrl,
    features: list, isAvailable: z.coerce.boolean().default(true),
  }),
  articles: z.object({
    title: z.string().min(2).max(200), slug,
    category: z.enum(["News", "Announcement"]),
    summary: z.string().min(10).max(500), featuredImage: optUrl,
    content: longText, author: z.string().min(2).max(100), tags: list,
    publishedDate: z.string().min(8), externalReferenceUrl: optUrl,
    isPublished: z.coerce.boolean().default(true),
  }),
  scholarships: z.object({
    title: z.string().min(2).max(200), slug,
    institution: z.string().min(2).max(200), country: z.string().min(2).max(100),
    fundingType: z.enum(["Full", "Partial"]), value: optText, deadline: optDate,
    eligibilitySummary: z.string().min(10).max(1000), requirements: longText,
    applicationUrl: url, isFeatured: z.coerce.boolean().default(false),
    isPublished: z.coerce.boolean().default(true),
  }),
  grants: z.object({
    title: z.string().min(2).max(200), slug,
    fundingOrganization: z.string().min(2).max(200), focalArea: z.string().min(2).max(200),
    grantAmount: optText, applicationDeadline: optDate,
    eligibility: longText, applicationUrl: url,
    isPublished: z.coerce.boolean().default(true),
  }),
  jobs: z.object({
    title: z.string().min(2).max(200), slug,
    organization: z.string().min(2).max(200), location: z.string().min(2).max(200),
    workMode: z.enum(["Remote", "Hybrid", "On-site"]),
    jobType: z.enum(["Full-time", "Contract", "Internship"]),
    salaryRange: optText, description: longText, deadline: optDate,
    applicationUrl: url, isPublished: z.coerce.boolean().default(true),
  }),
  empowerment: z.object({
    title: z.string().min(2).max(200), slug,
    organizer: z.string().min(2).max(200), programType: z.string().min(2).max(100),
    targetAudience: z.string().min(2).max(300), benefits: longText,
    deadline: optDate, registrationUrl: url,
    isPublished: z.coerce.boolean().default(true),
  }),
} as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
}).refine((value) => Boolean(value.email || value.phone), {
  message: "Add an email address or phone number so we can reply.",
});
