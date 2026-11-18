import "server-only";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function publicEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function siteBaseUrl(): string {
  const configuredUrl = publicEnv("NEXT_PUBLIC_SITE_URL");
  if (configuredUrl) return configuredUrl;

  const deploymentUrl = publicEnv("VERCEL_URL");
  return deploymentUrl ? `https://${deploymentUrl}` : "http://localhost:3000";
}
