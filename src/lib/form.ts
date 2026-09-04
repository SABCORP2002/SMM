import type { ZodError } from "zod";

/** Transforme les erreurs Zod en { champ: message } pour l'affichage. */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
