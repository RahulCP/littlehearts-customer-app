// src/pages/store/checkout/checkoutUtils.js

/* ---------------- cart helpers ---------------- */
export function getCartStorageKey(slug) {
  return `cart_${slug || "default"}`;
}

export function readCart(slug) {
  try {
    const raw = localStorage.getItem(getCartStorageKey(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(slug, cartItems) {
  localStorage.setItem(getCartStorageKey(slug), JSON.stringify(cartItems || []));
}

export function money(n) {
  const v = Number(n || 0);
  return v.toFixed(2);
}

export function toInt(v, def = 1) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(1, Math.trunc(n));
}

/**
 * Store-customer session keys:
 * - store_customer_token_<slug>
 * - store_customer_<slug>
 */
export function getCustomerSession(slug) {
  if (!slug) return { token: null, customer: null };

  const tokenKey = `store_customer_token_${slug}`;
  const customerKey = `store_customer_${slug}`;

  const token = localStorage.getItem(tokenKey);

  let customer = null;
  try {
    const raw = localStorage.getItem(customerKey);
    customer = raw ? JSON.parse(raw) : null;
  } catch {
    customer = null;
  }

  return { token: token || null, customer };
}

/* ---------------- coupon preview helpers (MANUAL only) ---------------- */
export function normalizeCoupon(cpn) {
  if (!cpn) return null;
  const pick = (...keys) => {
    for (const k of keys) {
      const v = cpn?.[k];
      if (v !== undefined && v !== null) return v;
    }
    return null;
  };

  return {
    ...cpn,
    id: String(pick("id") ?? ""),
    name: pick("name", "title") || null,
    code: pick("code", "coupon_code", "couponCode")
      ? String(pick("code", "coupon_code", "couponCode")).trim()
      : null,

    active: Boolean(pick("active", "is_active", "isActive") ?? true),

    discount_type: String(pick("discount_type", "discountType", "type") || "").toUpperCase(),
    discount_value: Number(pick("discount_value", "discountValue", "value") || 0),

    applies_to: String(pick("applies_to", "appliesTo") || "ORDER").toUpperCase(),
    min_subtotal: Number(pick("min_subtotal", "minSubtotal", "min") || 0),

    starts_at: pick("starts_at", "startsAt", "start_at", "startAt") || null,
    ends_at: pick("ends_at", "endsAt", "end_at", "endAt") || null,
  };
}

export function isWithinWindow(cpn) {
  const now = Date.now();
  const s = cpn?.starts_at ? new Date(cpn.starts_at).getTime() : null;
  const e = cpn?.ends_at ? new Date(cpn.ends_at).getTime() : null;

  if (s !== null && Number.isFinite(s) && now < s) return false;
  if (e !== null && Number.isFinite(e) && now > e) return false;
  return true;
}

/**
 * Manual coupon preview discount.
 * IMPORTANT: we apply manual preview on top of (subtotal - autoDiscountPreview),
 * so auto + manual can coexist and "stack" in UI.
 */
export function computeManualDiscountPreview({ subtotal, baseAfterAuto, rawCoupon }) {
  const cpn = normalizeCoupon(rawCoupon);
  if (!cpn) return 0;

  if (String(cpn.applies_to).toUpperCase() !== "ORDER") return 0;
  if (!cpn.active) return 0;
  if (!isWithinWindow(cpn)) return 0;

  const min = Number(cpn.min_subtotal || 0);

  // ✅ Eligibility check uses FULL subtotal
  if (Number(subtotal) < min) return 0;

  const type = String(cpn.discount_type || "").toUpperCase();
  const val = Number(cpn.discount_value || 0);
  if (!Number.isFinite(val) || val <= 0) return 0;

  // ✅ Discount amount is applied on baseAfterAuto (stacking)
  if (type === "PERCENT") {
    const pct = Math.min(100, Math.max(0, val));
    return (Number(baseAfterAuto) * pct) / 100;
  }

  if (type === "FLAT") {
    return Math.min(Number(baseAfterAuto), val);
  }

  return 0;
}

