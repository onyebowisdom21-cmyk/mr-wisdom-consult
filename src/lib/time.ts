import { cacheLife } from "next/cache";

export async function getUtcDate(): Promise<string> {
  "use cache";
  cacheLife("minutes");
  return new Date().toISOString().slice(0, 10);
}

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}
