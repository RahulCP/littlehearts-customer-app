import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";
import { buildImageUrl } from "../../utils/imageHelpers"; // ✅ adjust path if needed
import { getStyleMeta } from "../../config/styleOptions";

/* ---------------- CART HELPERS ---------------- */
function getCartStorageKey(slug) {
  return `cart_${slug || "default"}`;
}

function readCart(slug) {
  try {
    const raw = localStorage.getItem(getCartStorageKey(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("readCart error:", e);
    return [];
  }
}

function writeCart(slug, cartItems) {
  try {
    localStorage.setItem(getCartStorageKey(slug), JSON.stringify(cartItems || []));
  } catch (e) {
    console.error("writeCart error:", e);
  }
}

function money(n) {
  const v = Number(n || 0);
  return v.toFixed(2);
}

function styleMetaForLine(line) {
  return getStyleMeta(line?.style_id) || {
    label: line?.style_label || "",
    hex: line?.style_hex || "",
  };
}

function colorPillStyle(hex) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

function colorDotStyle(hex) {
  return {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: hex || "#fff",
    border: "1px solid rgba(0,0,0,0.25)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45)",
    flex: "0 0 auto",
  };
}

function formatDiscount(discount) {
  if (!discount) return "";
  const type = String(discount.discount_type || "").toUpperCase();
  const value = Number(discount.discount_value || 0);
  if (type === "PERCENT") return `${money(value).replace(/\.00$/, "")}% off`;
  if (type === "FLAT") return `₹${money(value)} off`;
  if (type === "FREE_GIFT") return "Free gift";
  return "Offer";
}

function calcDiscountAmount(discount, subtotal) {
  const base = Number(subtotal || 0);
  const type = String(discount?.discount_type || "").toUpperCase();
  const value = Number(discount?.discount_value || 0);

  if (!(base > 0) || !(value > 0)) return 0;
  if (type === "PERCENT") return Math.min(base, (base * value) / 100);
  if (type === "FLAT") return Math.min(base, value);
  return 0;
}

/* ---------------- UI HELPERS ---------------- */
const FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"';

function isNumberLike(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

/**
 * Tries to build a product-details route from whatever is available in cart line.
 */
function buildProductUrl(slug, line) {
  const productUid = line?.product_uid || line?.productId || line?.product_id;
  const productSlug = line?.product_slug || line?.productSlug;

  if (productUid) return `/store/${slug}/product/${productUid}`;
  if (productSlug) return `/store/${slug}/product/${productSlug}`;
  return `/store/${slug}/products`;
}

/**
 * ✅ Extract best image token from cart line
 * Supports:
 *  - line.image (your old field)
 *  - line.image_key / line.storageKey
 *  - line.images[0]
 *  - full URL already stored
 */
function pickCartImage(line) {
  return (
    line?.image ||
    line?.image_key ||
    line?.storageKey ||
    (Array.isArray(line?.images) ? line.images[0] : "") ||
    ""
  );
}

export default function MyCart() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");
  const [autoCoupon, setAutoCoupon] = useState(null);
  const [autoDiscount, setAutoDiscount] = useState(0);
  const [genericOffers, setGenericOffers] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponsOpen, setCouponsOpen] = useState(false);

  useEffect(() => {
    setCart(readCart(slug));
  }, [slug]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      const price = Number(line?.selling_price || 0);
      const qty = Number(line?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, line) => sum + Number(line?.quantity || 1), 0);
  }, [cart]);

  const nextAutoOffer = useMemo(() => {
    if (autoCoupon || !genericOffers.length) return null;
    const sorted = genericOffers
      .map((offer) => ({ ...offer, min_subtotal_num: Number(offer?.min_subtotal || 0) }))
      .filter((offer) => offer.min_subtotal_num > Number(subtotal || 0))
      .sort((a, b) => a.min_subtotal_num - b.min_subtotal_num);
    return sorted[0] || null;
  }, [autoCoupon, genericOffers, subtotal]);

  const couponRows = useMemo(() => {
    const byId = new Map();
    const source = [
      ...(Array.isArray(genericOffers) ? genericOffers : []),
      ...(autoCoupon ? [autoCoupon] : []),
    ];

    source.forEach((offer) => {
      if (!offer) return;
      const key = String(offer.id || offer.code || offer.name || Math.random());
      if (!byId.has(key)) byId.set(key, offer);
    });

    return Array.from(byId.values())
      .map((offer) => {
        const minSubtotal = Number(offer?.min_subtotal || 0);
        const eligible = Number(subtotal || 0) >= minSubtotal;
        const saving = eligible ? calcDiscountAmount(offer, subtotal) : 0;
        const checkoutAmount = Math.max(0, Number(subtotal || 0) - saving);
        return {
          offer,
          eligible,
          saving,
          checkoutAmount,
          minSubtotal,
          needMore: Math.max(0, minSubtotal - Number(subtotal || 0)),
          selected:
            autoCoupon &&
            String(offer.id || offer.code || offer.name) ===
              String(autoCoupon.id || autoCoupon.code || autoCoupon.name),
        };
      })
      .sort((a, b) => {
        if (a.selected !== b.selected) return a.selected ? -1 : 1;
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.minSubtotal - a.minSubtotal;
      });
  }, [autoCoupon, genericOffers, subtotal]);

  useEffect(() => {
    let cancelled = false;

    async function loadAutoCouponPreview() {
      if (!slug || !cart.length) {
        setAutoCoupon(null);
        setAutoDiscount(0);
        setGenericOffers([]);
        return;
      }

      setCouponLoading(true);
      try {
        const items = cart
          .map((line) => ({
            item_uid: line?.item_uid,
            quantity: Math.max(1, Number(line?.quantity || 1)),
          }))
          .filter((line) => line.item_uid);

        if (!items.length) {
          if (!cancelled) {
            setAutoCoupon(null);
            setAutoDiscount(0);
            setGenericOffers([]);
          }
          return;
        }

        const [evaluateRes, genericRes] = await Promise.all([
          axios.post(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/evaluate`, {
            items,
            coupon_code: null,
            auto: true,
          }),
          axios.get(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/generic`),
        ]);

        if (cancelled) return;

        setAutoCoupon(evaluateRes.data?.applied || null);
        setAutoDiscount(Number(evaluateRes.data?.totals?.discount_total || 0));
        setGenericOffers(Array.isArray(genericRes.data?.offers) ? genericRes.data.offers : []);
      } catch {
        if (!cancelled) {
          setAutoCoupon(null);
          setAutoDiscount(0);
          setGenericOffers([]);
        }
      } finally {
        if (!cancelled) setCouponLoading(false);
      }
    }

    loadAutoCouponPreview();

    return () => {
      cancelled = true;
    };
  }, [slug, cart, subtotal]);

  const sync = (next) => {
    setCart(next);
    writeCart(slug, next);
  };

  const incQty = (item_uid) => {
    const next = cart.map((x) => {
      if (x.item_uid !== item_uid) return x;

      const current = Number(x.quantity || 1);
      const stock = x.stocked_quantity == null ? null : Number(x.stocked_quantity);

      if (stock != null && Number.isFinite(stock) && current >= stock) {
        setToast("Reached max stock.");
        return x;
      }

      return { ...x, quantity: current + 1, updated_at: new Date().toISOString() };
    });

    sync(next);
  };

  const decQty = (item_uid) => {
    const next = cart
      .map((x) => {
        if (x.item_uid !== item_uid) return x;
        const current = Number(x.quantity || 1);
        const nextQty = Math.max(0, current - 1);
        return { ...x, quantity: nextQty, updated_at: new Date().toISOString() };
      })
      .filter((x) => Number(x.quantity || 0) > 0);

    sync(next);
  };

  const removeLine = (item_uid) => {
    const next = cart.filter((x) => x.item_uid !== item_uid);
    sync(next);
    setToast("Removed from cart.");
  };

  const handleBuyNow = () => {
    if (!cart.length) {
      setToast("Your cart is empty.");
      return;
    }
    navigate(`/store/${slug}/checkout`);
  };

  const goLogin = () => navigate(`/store/${slug}/login`);
  const continueShopping = () => navigate(`/store/${slug}/products`);

  const openProduct = (line) => {
    const url = buildProductUrl(slug, line);
    navigate(url);
  };

  const styles = {
    page: { padding: 16, maxWidth: 980, margin: "0 auto", fontFamily: FONT_STACK },
    toast: {
      position: "fixed",
      right: 20,
      bottom: 20,
      background: "#111",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: 12,
      fontSize: 13,
      boxShadow: "0 10px 22px rgba(0,0,0,0.28)",
      zIndex: 9999,
      maxWidth: 320,
      fontFamily: FONT_STACK,
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 10,
    },
    h1: { margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.15 },
    btn: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
      fontFamily: FONT_STACK,
    },
    emptyCard: {
      marginTop: 18,
      padding: 18,
      border: "1px solid #eee",
      borderRadius: 16,
      background: "#fff",
      boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
    },
    emptyTitle: { margin: 0, fontSize: 18, fontWeight: 950, letterSpacing: "-0.01em" },
    emptyDesc: { margin: "8px 0 0", color: "#6b7280", fontSize: 13, lineHeight: 1.45 },
    emptyActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 },
    primaryBtn: {
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid #0f766e",
      background: "#0f766e",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 900,
      fontSize: 14,
      fontFamily: FONT_STACK,
    },
    ghostBtn: {
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#111",
      cursor: "pointer",
      fontWeight: 900,
      fontSize: 14,
      fontFamily: FONT_STACK,
    },
    subtleRow: { marginTop: 10, color: "#6b7280", fontSize: 13 },
    linkBtn: {
      marginLeft: 6,
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      fontWeight: 900,
      color: "#0f766e",
      fontFamily: FONT_STACK,
    },
    contentGrid: { marginTop: 14, display: "grid", gap: 12 },
    lineCard: {
      border: "1px solid #eee",
      borderRadius: 16,
      background: "#fff",
      overflow: "hidden",
      boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
    },
    lineInner: {
      display: "grid",
      gridTemplateColumns: "88px 1fr",
      gap: 12,
      padding: 12,
      alignItems: "center",
    },
    imgBox: {
      width: 88,
      height: 88,
      borderRadius: 14,
      background: "#f3f4f6",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #eee",
    },
    nameRow: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
    nameLink: {
      fontWeight: 950,
      fontSize: 15,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
      margin: 0,
      cursor: "pointer",
      userSelect: "none",
    },
    removeBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#fff",
      cursor: "pointer",
      height: 36,
      whiteSpace: "nowrap",
      fontWeight: 900,
      fontSize: 12,
      fontFamily: FONT_STACK,
    },
    pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
    pill: {
      fontSize: 12,
      color: "#111",
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      padding: "6px 8px",
      borderRadius: 999,
      fontWeight: 800,
    },
    footerBar: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      alignItems: "center",
      padding: 12,
      borderTop: "1px solid #eee",
      background: "#fafafa",
      flexWrap: "wrap",
    },
    qtyBox: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "6px 8px",
      background: "#fff",
    },
    qtyBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      border: "1px solid #eee",
      background: "#fff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 950,
      fontFamily: FONT_STACK,
    },
    qtyNum: { minWidth: 28, textAlign: "center", fontWeight: 950, fontSize: 14 },
    priceBox: { textAlign: "right" },
    price: { fontWeight: 950, fontSize: 14, margin: 0 },
    lineTotal: { fontWeight: 1000, fontSize: 16, margin: "2px 0 0" },
    muted: { fontSize: 12, color: "#6b7280" },
    summaryWrap: {
      marginTop: 14,
      position: "sticky",
      bottom: 0,
      zIndex: 20,
      background:
        "linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.90), rgba(255,255,255,0))",
      paddingTop: 12,
    },
    summaryCard: {
      border: "1px solid #eee",
      borderRadius: 18,
      padding: 14,
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    summaryTitle: { margin: 0, fontSize: 15, fontWeight: 1000, letterSpacing: "-0.01em" },
    row: { display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 },
    autoCouponCard: {
      marginTop: 12,
      padding: 12,
      borderRadius: 16,
      border: "1px solid #d9f0e5",
      background: "#f3fbf7",
      display: "grid",
      gap: 6,
    },
    autoCouponTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      alignItems: "baseline",
      flexWrap: "wrap",
    },
    autoCouponTitle: { fontSize: 13, fontWeight: 1000, color: "#0f3f32" },
    autoCouponSave: { fontSize: 14, fontWeight: 1000, color: "#0f766e" },
    autoCouponNote: { margin: 0, fontSize: 12, color: "#4b6359", lineHeight: 1.4 },
    couponLink: {
      border: "none",
      background: "transparent",
      color: "#0f766e",
      cursor: "pointer",
      fontWeight: 1000,
      fontSize: 13,
      padding: 0,
      textDecoration: "underline",
      fontFamily: FONT_STACK,
    },
    overlay: {
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(17,24,39,0.46)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 14,
    },
    couponPanel: {
      width: "min(560px, 100%)",
      maxHeight: "82vh",
      overflow: "auto",
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #e5e7eb",
      boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
      padding: 14,
    },
    couponPanelHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      marginBottom: 12,
    },
    couponPanelTitle: { margin: 0, fontSize: 18, fontWeight: 1000 },
    couponClose: {
      border: "1px solid #e5e7eb",
      background: "#fff",
      borderRadius: 999,
      width: 34,
      height: 34,
      cursor: "pointer",
      fontWeight: 1000,
      fontFamily: FONT_STACK,
    },
    couponList: { display: "grid", gap: 10 },
    couponOption: (eligible, selected) => ({
      border: selected ? "1px solid #0f766e" : "1px solid #e5e7eb",
      background: selected ? "#f3fbf7" : "#fff",
      borderRadius: 14,
      padding: 12,
      display: "grid",
      gap: 8,
      opacity: eligible ? 1 : 0.72,
    }),
    couponTag: (eligible) => ({
      display: "inline-flex",
      alignItems: "center",
      width: "fit-content",
      borderRadius: 999,
      padding: "4px 8px",
      fontSize: 11,
      fontWeight: 1000,
      background: eligible ? "#e7f7ef" : "#fff4e5",
      color: eligible ? "#0f766e" : "#9a4b00",
    }),
    couponOptionTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      alignItems: "flex-start",
    },
    couponOptionName: { fontSize: 14, fontWeight: 1000, color: "#111827" },
    couponOptionSaving: { fontSize: 14, fontWeight: 1000, color: "#0f766e", whiteSpace: "nowrap" },
    divider: { height: 1, background: "#eee", margin: "12px 0" },
    totalRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
    totalLabel: { color: "#111", fontWeight: 950, fontSize: 13 },
    totalVal: { fontWeight: 1000, fontSize: 18 },
    buyBtn: {
      width: "100%",
      marginTop: 12,
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid #0f766e",
      background: "#0f766e",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 1000,
      fontSize: 15,
      fontFamily: FONT_STACK,
    },
    note: { margin: "10px 0 0", fontSize: 12, color: "#6b7280", lineHeight: 1.35 },
  };

  return (
    <div style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}
      {couponsOpen && (
        <div style={styles.overlay} onClick={() => setCouponsOpen(false)}>
          <div style={styles.couponPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.couponPanelHeader}>
              <div>
                <h2 style={styles.couponPanelTitle}>Auto coupons</h2>
                <p style={{ ...styles.autoCouponNote, marginTop: 4 }}>
                  These are preview estimates. The eligible auto coupon will be applied and confirmed at checkout page.
                </p>
              </div>
              <button style={styles.couponClose} onClick={() => setCouponsOpen(false)} type="button">
                X
              </button>
            </div>

            <div style={styles.couponList}>
              {couponLoading ? (
                <div style={styles.couponOption(true, false)}>
                  <p style={styles.autoCouponNote}>Checking available auto coupons...</p>
                </div>
              ) : couponRows.length ? (
                couponRows.map((row) => (
                  <div
                    key={String(row.offer.id || row.offer.code || row.offer.name)}
                    style={styles.couponOption(row.eligible, row.selected)}
                  >
                    <div style={styles.couponOptionTop}>
                      <div>
                        <div style={styles.couponOptionName}>{row.offer.name || "Auto offer"}</div>
                        <p style={{ ...styles.autoCouponNote, marginTop: 3 }}>
                          {formatDiscount(row.offer)}
                          {row.offer.code ? ` · Code ${String(row.offer.code).toUpperCase()}` : ""}
                          {row.minSubtotal > 0 ? ` · Min cart ₹${money(row.minSubtotal)}` : ""}
                        </p>
                      </div>
                      {row.eligible ? (
                        <div style={styles.couponOptionSaving}>Save ₹{money(row.saving)}</div>
                      ) : null}
                    </div>

                    <span style={styles.couponTag(row.eligible)}>
                      {row.eligible
                        ? row.selected
                          ? "Will apply at checkout"
                          : "Eligible at checkout"
                        : `Add ₹${money(row.needMore)} more`}
                    </span>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                      <span style={{ color: "#6b7280", fontWeight: 800 }}>Estimated checkout amount</span>
                      <strong>₹{money(row.checkoutAmount)}</strong>
                    </div>

                    <p style={styles.autoCouponNote}>
                      This coupon will be applied automatically at checkout page if your cart is still eligible.
                    </p>
                  </div>
                ))
              ) : (
                <div style={styles.couponOption(true, false)}>
                  <p style={styles.autoCouponNote}>
                    No auto coupons are available right now. Checkout will still check again before payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>My Cart</h1>
        </div>

        {cart.length ? (
          <button onClick={continueShopping} style={styles.btn}>
            Continue Shopping
          </button>
        ) : null}
      </div>

      {!cart.length ? (
        <div style={styles.emptyCard}>
          <h2 style={styles.emptyTitle}>Your cart is empty</h2>
          <p style={styles.emptyDesc}>Add something you love ✨ and come back here to checkout.</p>

          <div style={styles.emptyActions}>
            <button onClick={continueShopping} style={styles.primaryBtn}>
              Continue shopping
            </button>
            <button onClick={() => navigate(`/store/${slug}/login`)} style={styles.ghostBtn}>
              Log in
            </button>
          </div>

          <div style={styles.subtleRow}>
            Have an account?
            <button onClick={() => navigate(`/store/${slug}/login`)} style={styles.linkBtn}>
              Log in to check out faster.
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.contentGrid}>
            {cart.map((line) => {
              const qty = Number(line.quantity || 1);
              const price = Number(line.selling_price || 0);
              const lineTotal = price * qty;

              const stock = line.stocked_quantity == null ? null : Number(line.stocked_quantity);
              const hasStock = stock != null && Number.isFinite(stock);

              const imgToken = pickCartImage(line);
              const imgSrc = buildImageUrl(imgToken);
              const styleMeta = styleMetaForLine(line);

              return (
                <div key={`${line.store_slug}-${line.item_uid}`} style={styles.lineCard}>
                  <div style={styles.lineInner}>
                    <div style={styles.imgBox}>
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={line.product_label || "product"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            // optional: hide broken images
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
                          No image
                        </span>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={styles.nameRow}>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={styles.nameLink}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(buildProductUrl(slug, line))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") navigate(buildProductUrl(slug, line));
                            }}
                            title="View product"
                          >
                            {line.product_label || "Product"}
                          </p>

                          <div style={styles.pillRow}>
                            {styleMeta?.label ? (
                              <span style={{ ...styles.pill, ...colorPillStyle(styleMeta.hex) }}>
                                {styleMeta.hex ? <span style={colorDotStyle(styleMeta.hex)} /> : null}
                                {styleMeta.label}
                              </span>
                            ) : null}
                            {line.subcategory_label ? (
                              <span style={styles.pill}>{line.subcategory_label}</span>
                            ) : null}
                            {hasStock ? <span style={styles.pill}>Stock: {stock}</span> : null}
                          </div>
                        </div>

                        <button onClick={() => removeLine(line.item_uid)} style={styles.removeBtn}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.footerBar}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={styles.qtyBox}>
                        <button onClick={() => decQty(line.item_uid)} style={styles.qtyBtn}>
                          –
                        </button>
                        <div style={styles.qtyNum}>{qty}</div>
                        <button onClick={() => incQty(line.item_uid)} style={styles.qtyBtn}>
                          +
                        </button>
                      </div>

                      <div style={styles.muted}>
                        {isNumberLike(price) ? <>₹{money(price)} each</> : null}
                      </div>
                    </div>

                    <div style={styles.priceBox}>
                      <p style={styles.price}>Line Total</p>
                      <p style={styles.lineTotal}>₹{money(lineTotal)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.summaryWrap}>
            <div style={styles.summaryCard}>
              <p style={styles.summaryTitle}>Order Summary</p>

              <div style={styles.row}>
                <span style={{ color: "#6b7280" }}>Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div style={styles.row}>
                <span style={{ color: "#6b7280" }}>Subtotal</span>
                <strong>₹{money(subtotal)}</strong>
              </div>

              <div style={styles.autoCouponCard}>
                <div style={styles.autoCouponTop}>
                  <span style={styles.autoCouponTitle}>Coupons</span>
                  <button style={styles.couponLink} onClick={() => setCouponsOpen(true)} type="button">
                    View coupons
                  </button>
                </div>
                {couponLoading ? (
                  <p style={styles.autoCouponNote}>Checking auto coupons for checkout...</p>
                ) : autoCoupon ? (
                  <p style={styles.autoCouponNote}>
                    {autoCoupon.name || "Best offer"} can save ₹{money(autoDiscount)}. It will be applied and
                    confirmed at checkout page.
                  </p>
                ) : nextAutoOffer ? (
                  <p style={styles.autoCouponNote}>
                    Add ₹{money(Number(nextAutoOffer.min_subtotal || 0) - Number(subtotal || 0))} more
                    to unlock {nextAutoOffer.name || "an auto coupon"}. Auto coupons apply at checkout page.
                  </p>
                ) : (
                  <p style={styles.autoCouponNote}>
                    Auto coupons will be checked and applied automatically during checkout if your cart is eligible.
                  </p>
                )}
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalVal}>₹{money(subtotal)}</span>
              </div>

              <button onClick={handleBuyNow} style={styles.buyBtn}>
                Buy Now
              </button>

              <p style={styles.note}>Buy Now will take you to checkout.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
