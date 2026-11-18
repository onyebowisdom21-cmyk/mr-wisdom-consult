const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toSnake(o: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [snake(k), v]));
}
export function toCamel<T>(o: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [camel(k), v])) as T;
}
