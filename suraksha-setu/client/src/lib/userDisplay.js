/** First name from full name, or masked phone tail for welcome UI */
export function displayNameForWelcome(u) {
  if (!u) return "";
  const raw = u.fullName?.trim();
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    return parts[0] || raw;
  }
  const digits = String(u.phone || "").replace(/\D/g, "");
  if (digits.length >= 4) return `User · …${digits.slice(-4)}`;
  return u.phone ? String(u.phone) : "";
}
