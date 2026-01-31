// src/pages/store/CouponsDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";

/* ---------------- helpers ---------------- */
function money0(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}
function fmtEnds(ends_at) {
  if (!ends_at) return "";
  const d = new Date(ends_at);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString();
}
function typeLabel(d) {
  const t = String(d?.discount_type || "").toUpperCase();
  const v = Number(d?.discount_value || 0);
  if (t === "PERCENT") return `${money0(v)}% OFF`;
  if (t === "FLAT") return `₹${money0(v)} OFF`;
  if (t === "FREE_GIFT") return `FREE GIFT`;
  return t || "OFFER";
}

function raf2(fn) {
  // double-RAF for smooth first + subsequent opens
  if (typeof window === "undefined" || !window.requestAnimationFrame) {
    setTimeout(fn, 0);
    return;
  }
  window.requestAnimationFrame(() => window.requestAnimationFrame(fn));
}

export default function CouponsDrawer({
  open,
  onClose,
  slug,
  customerToken,

  // manual coupons (with code)
  coupons: couponsProp = [],
  onNeedRefresh,

  selectedId,
  onPickCoupon,

  // generic offers (no code)
  genericOffers = [],
  genericLoading = false,

  // what checkout already applied (auto lane)
  autoApplied = null,
  autoDiscount = 0,
}) {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [err, setErr] = useState("");

  // animation
  const [mounted, setMounted] = useState(!!open);
  const [visible, setVisible] = useState(!!open);

  const canUseCoupons = !!(slug && customerToken);

  const mergedCoupons = useMemo(() => {
    const list = Array.isArray(couponsProp) && couponsProp.length ? couponsProp : coupons;
    return Array.isArray(list) ? list : [];
  }, [couponsProp, coupons]);

  const safeGenericOffers = useMemo(() => {
    return Array.isArray(genericOffers) ? genericOffers : [];
  }, [genericOffers]);

  const appliedAutoId = autoApplied?.id != null ? String(autoApplied.id) : null;
  const hasAutoApplied = !!(autoApplied && autoApplied.name);

  async function fetchCoupons() {
    if (!canUseCoupons) return [];
    setLoading(true);
    setErr("");
    try {
      const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/available`;
      const headers = { Authorization: `Bearer ${customerToken}` };
      const res = await axios.get(url, { headers });

      const list = res.data?.coupons || res.data?.discounts || [];
      const arr = Array.isArray(list) ? list : [];
      setCoupons(arr);
      return arr;
    } catch (e) {
      setCoupons([]);
      setErr(e?.response?.data?.error || e.message || "Failed to load coupons");
      return [];
    } finally {
      setLoading(false);
    }
  }

  // open / close animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      raf2(() => setVisible(true));
      return;
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }, [open]);

  // lock scroll + ESC
  useEffect(() => {
    if (!mounted) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mounted, onClose]);

  // fetch manual coupons on open (if parent didn't pass them)
  useEffect(() => {
    if (!open) return;
    if (!canUseCoupons) return;

    if (Array.isArray(couponsProp) && couponsProp.length) return;

    if (onNeedRefresh) {
      onNeedRefresh().catch(() => fetchCoupons());
    } else {
      fetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  const S = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: visible ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "stretch",
      transition: visible ? "background 360ms ease-out" : "background 200ms ease-in",
    },
    sheet: {
      width: "min(460px, 92vw)",
      height: "100vh",
      background: "#fff",
      borderTopLeftRadius: 18,
      borderBottomLeftRadius: 18,
      boxShadow: "-12px 0 30px rgba(0,0,0,0.20)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transform: visible ? "translateX(0)" : "translateX(100%)",
      transition: visible
        ? "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)"
        : "transform 200ms cubic-bezier(0.4, 0, 1, 1)",
      willChange: "transform",
    },
    header: {
      padding: "12px 14px",
      borderBottom: "1px solid #eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(180deg, #f9fafb, #fff)",
    },
    title: { margin: 0, fontSize: 16, fontWeight: 900 },
    sub: { fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.35 },
    closeBtn: {
      border: "1px solid #ddd",
      background: "#fff",
      borderRadius: 10,
      padding: "8px 10px",
      fontWeight: 900,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    content: { padding: 14, overflow: "auto" },

    banner: {
      border: "1px solid #d1fae5",
      background: "#ecfdf5",
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    bannerTitle: { fontWeight: 900, color: "#065f46" },
    bannerSub: { marginTop: 4, fontSize: 12, color: "#065f46", opacity: 0.9 },

    section: { marginTop: 12 },
    sectionTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
    sectionTitle: { fontSize: 13, fontWeight: 900 },
    sectionHint: { fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.35 },

    info: {
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      padding: 12,
      borderRadius: 12,
      color: "#374151",
      fontSize: 13,
      lineHeight: 1.35,
      marginTop: 10,
    },

    topRow: { display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", marginTop: 10 },
    refreshBtn: {
      border: "1px solid #ddd",
      background: "#fff",
      borderRadius: 12,
      padding: "10px 12px",
      fontWeight: 900,
      cursor: "pointer",
    },

    grid: { display: "grid", gap: 10, marginTop: 10 },
    row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },

    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #eee",
      background: "#fafafa",
      fontSize: 12,
      fontWeight: 900,
      color: "#111",
    },
    pillAuto: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px dashed #cbd5e1",
      background: "#f8fafc",
      fontSize: 12,
      fontWeight: 900,
      color: "#475569",
    },
    pillApplied: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #0f766e",
      background: "#e0f2f1",
      fontSize: 12,
      fontWeight: 900,
      color: "#0f766e",
    },
    codePill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #0f766e",
      background: "#e0f2f1",
      fontSize: 12,
      fontWeight: 900,
      color: "#0f766e",
    },

    offerCard: (isApplied) => ({
      border: isApplied ? "1px solid #10b981" : "1px solid #eee",
      background: isApplied ? "linear-gradient(180deg, #ecfdf5, #fff)" : "#fff",
      borderRadius: 14,
      padding: 12,
    }),
    couponBtn: (active) => ({
      border: active ? "1px solid #0f766e" : "1px solid #eee",
      background: active ? "linear-gradient(180deg, #e0f2f1, #fff)" : "#fff",
      borderRadius: 14,
      padding: 12,
      cursor: "pointer",
      textAlign: "left",
    }),

    name: { marginTop: 8, fontWeight: 900, fontSize: 14 },
    msg: { marginTop: 4, fontSize: 12, color: "#666", lineHeight: 1.35 },

    err: { marginTop: 10, fontSize: 12, color: "#b91c1c", fontWeight: 800 },
    loading: { padding: 14, color: "#111", fontWeight: 800 },
  };

  return (
    <div
      style={S.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={S.sheet} role="dialog" aria-modal="true">
        <div style={S.header}>
          <div>
            <h3 style={S.title}>Offers & Coupons</h3>
            <div style={S.sub}>
              Auto offers apply automatically (if eligible). You can also pick <b>one</b> coupon code.
            </div>
          </div>

          <button style={S.closeBtn} onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div style={S.content}>
          {/* banner if auto applied */}
          {hasAutoApplied ? (
            <div style={S.banner}>
              <div style={S.bannerTitle}>✅ Already applied</div>
              <div style={S.bannerSub}>
                {autoApplied?.name}
                {Number(autoDiscount || 0) > 0 ? ` • Saving ₹${money0(autoDiscount)}` : ""}
              </div>
            </div>
          ) : null}

          {/* AUTO OFFERS */}
          <div style={S.section}>
            <div style={S.sectionTitleRow}>
              <div style={S.sectionTitle}>Auto offers (no code)</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                {genericLoading ? "Loading…" : `${safeGenericOffers.length}`}
              </div>
            </div>
            <div style={S.sectionHint}>
              These are currently active store-wide offers. Checkout will automatically choose the best one for your cart.
            </div>

            {genericLoading ? (
              <div style={S.loading}>Loading offers…</div>
            ) : safeGenericOffers.length === 0 ? (
              <div style={S.info}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>No active offers</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Offers with <b>code = null</b> and <b>audience = ALL</b> show up here.
                </div>
              </div>
            ) : (
              <div style={S.grid}>
                {safeGenericOffers.map((d) => {
                  const id = String(d?.id ?? "");
                  const isApplied = appliedAutoId && id === appliedAutoId;

                  return (
                    <div key={id} style={S.offerCard(isApplied)}>
                      <div style={S.row}>
                        <div style={S.pill}>{typeLabel(d)}</div>
                        {d.min_subtotal ? <div style={S.pill}>Min ₹{money0(d.min_subtotal)}</div> : null}
                        {d.ends_at ? <div style={S.pill}>Ends {fmtEnds(d.ends_at)}</div> : null}
                        <div style={S.pillAuto}>Auto</div>
                        {isApplied ? <div style={S.pillApplied}>Applied</div> : null}
                      </div>

                      <div style={S.name}>{d.name || "Offer"}</div>
                      {d.free_gift_note ? (
                        <div style={S.msg}>{String(d.free_gift_note)}</div>
                      ) : (
                        <div style={S.msg}>Applied automatically if eligible.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "#eee", margin: "16px 0" }} />

          {/* MANUAL COUPONS */}
          <div style={S.section}>
            <div style={S.sectionTitleRow}>
              <div style={S.sectionTitle}>Coupons (use code)</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                {!canUseCoupons ? "Login required" : loading ? "Loading…" : `${mergedCoupons.length}`}
              </div>
            </div>
            <div style={S.sectionHint}>
              Tap a coupon to select it. You can select one coupon code; auto offers may still apply separately.
            </div>

            {!canUseCoupons ? (
              <div style={S.info}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Login required</div>
                Coupons with codes are visible only after login.
              </div>
            ) : loading ? (
              <div style={S.loading}>Loading coupons…</div>
            ) : mergedCoupons.length === 0 ? (
              <div style={S.info}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>No coupons available</div>
                {err ? <div style={S.err}>{err}</div> : null}
              </div>
            ) : (
              <>
                <div style={S.topRow}>
                  <button style={S.refreshBtn} onClick={fetchCoupons} type="button">
                    Refresh
                  </button>
                </div>

                <div style={S.grid}>
                  {mergedCoupons.map((d) => {
                    const id = String(d?.id ?? "");
                    const isSelected = selectedId != null && String(selectedId) === id;

                    return (
                      <button
                        key={id || String(d?.code || "")}
                        style={S.couponBtn(isSelected)}
                        onClick={() => onPickCoupon?.(d)}
                        type="button"
                      >
                        <div style={S.row}>
                          {d.code ? <div style={S.codePill}>{String(d.code).toUpperCase()}</div> : null}
                          <div style={S.pill}>{typeLabel(d)}</div>
                          {d.min_subtotal ? <div style={S.pill}>Min ₹{money0(d.min_subtotal)}</div> : null}
                          {d.ends_at ? <div style={S.pill}>Ends {fmtEnds(d.ends_at)}</div> : null}
                          {isSelected ? <div style={S.pillApplied}>Selected</div> : null}
                        </div>

                        <div style={S.name}>{d.name || "Coupon"}</div>
                        {d.message ? (
                          <div style={S.msg}>{String(d.message)}</div>
                        ) : (
                          <div style={S.msg}>Tap to apply this coupon.</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {err ? <div style={S.err}>{err}</div> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
