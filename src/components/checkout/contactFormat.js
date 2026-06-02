export function normalizePhoneInput(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(value) {
  return /^[6-9]\d{9}$/.test(normalizePhoneInput(value));
}

export function normalizeEmailInput(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmailInput(value));
}
