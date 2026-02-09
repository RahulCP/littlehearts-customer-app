import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildImageUrl } from "../../utils/imageHelpers"; // ✅ adjust path if needed

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
                            {line.style_label ? <span style={styles.pill}>{line.style_label}</span> : null}
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
