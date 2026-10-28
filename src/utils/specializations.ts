import type { Specialization } from "@/redux/api/doctorApi";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function specializationList(response: unknown): Specialization[] {
  let value = response;
  for (let depth = 0; depth < 5 && !Array.isArray(value); depth += 1) {
    if (typeof value !== "object" || value === null) break;
    const record = value as Record<string, unknown>;
    const key = ["data", "specializations", "items", "results"].find((candidate) => record[candidate] !== undefined);
    if (!key) break;
    value = record[key];
  }
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Specialization => {
    if (typeof item !== "object" || item === null) return false;
    const candidate = item as Record<string, unknown>;
    return UUID_PATTERN.test(String(candidate.id ?? "")) && typeof candidate.name === "string";
  });
}

export function splitSpecializationValues(value: string | string[]): string[] {
  return (Array.isArray(value) ? value : value.split(/[\n,]/))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function resolveSpecializationIds(values: string[], options: Specialization[]) {
  const byId = new Map(options.map((item) => [item.id.toLowerCase(), item.id]));
  const byLabel = new Map<string, string>();
  options.forEach((item) => {
    byLabel.set(item.name.trim().toLowerCase(), item.id);
    if (item.slug) byLabel.set(item.slug.trim().toLowerCase(), item.id);
  });

  const ids: string[] = [];
  const unresolved: string[] = [];
  values.forEach((value) => {
    const normalized = value.trim().toLowerCase();
    const id = (UUID_PATTERN.test(value) ? byId.get(normalized) : undefined) ?? byLabel.get(normalized);
    if (id) {
      if (!ids.includes(id)) ids.push(id);
    } else {
      unresolved.push(value);
    }
  });
  return { ids, unresolved };
}
