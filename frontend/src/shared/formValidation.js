export function sanitizeNameValue(value) {
  return String(value ?? "")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateNameValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "Name is required.";
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/.test(raw)) {
    return "Names may only contain letters, spaces, apostrophes, periods, or hyphens.";
  }
  return "";
}
