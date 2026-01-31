import React from "react";
import { money, toInt } from "./checkoutUtils";

export default function OrderSummary({
  S,
  cart,
  totalItems,
  subtotal,
  updateQty,

  customerToken,
  couponLoading,
  availableCoupons,
  onOpenCoupons,

  // auto
  autoName,
  autoDiscount,

  // manual
  manualName,
  manualSelected,
  onRemoveManual,

  manualDiscountPreview,
  grandTotal,
}) {
  const hasManualSelected = !!(manualSelected?.code || manualName);
  const isLoggedIn = !!customerToken;

  // Label for the right-side link
  // - If manual selected => "Remove coupon"
  // - else => "Coupons"
  const couponLinkText = hasManualSelected ? "Remove coupon" : "Coupons";

  // Disable only when loading OR missing handlers
  const disableCouponAction = couponLoading || (!hasManualSelected && !onOpenCoupons);

  return (
    <div style={{ ...S.card, position: "sticky", top: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 16, fontWeight: 900 }}>Order Summary</div>
        <div style={S.muted}>{totalItems} items</div>
      </div>

      {/* Coupons row */}
     
      {/* Cart lines */}
      <div style={{ marginTop: 10, display: "grid", gap: 10, maxHeight: 320, overflow: "auto" }}>
        {cart.map((x) => (
          <div
            key={x.item_uid}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 10,
              padding: "10px 10px",
              border: "1px solid #eee",
              borderRadius: 12,
              background: "#fafafa",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 4 }}>{x.product_label || "Product"}</div>

              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => updateQty(x.item_uid, -1)} style={S.miniBtn} type="button">
                  –
                </button>
                <div style={{ fontWeight: 900, width: 26, textAlign: "center" }}>{toInt(x.quantity || 1, 1)}</div>
                <button onClick={() => updateQty(x.item_uid, +1)} style={S.miniBtn} type="button">
                  +
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#666" }}>₹{money(x.selling_price)}</div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 6 }}>
                ₹{money(Number(x.selling_price || 0) * toInt(x.quantity || 1, 1))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={S.muted}>Subtotal</span>
        <strong>₹{money(subtotal)}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={S.muted}>Shipping</span>
        <strong>₹{money(0)}</strong>
      </div>

      {/* Discounts (only if > 0) */}
      {Number(autoDiscount || 0) > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={S.muted}>{autoName ? `Offer: ${autoName}` : "Offer"}</span>
          <strong>- ₹{money(autoDiscount)}</strong>
        </div>
      ) : null}

      {Number(manualDiscountPreview || 0) > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={S.muted}>{manualName ? `Coupon: ${manualName}` : "Coupon"}</span>
          <strong>- ₹{money(manualDiscountPreview)}</strong>
        </div>
      ) : null}
       <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 900 }}></div>

        {hasManualSelected ? (
          <button
            style={S.link}
            onClick={onRemoveManual}
            type="button"
            disabled={couponLoading || !onRemoveManual}
            title={manualSelected?.code ? `Remove ${String(manualSelected.code).toUpperCase()}` : "Remove coupon"}
          >
            {couponLoading ? "Please wait…" : "Remove coupon"}
          </button>
        ) : (
          <button
            style={S.link}
            onClick={onOpenCoupons}
            disabled={disableCouponAction}
            type="button"
            title={
              isLoggedIn
                ? "View all available coupons"
                : "View today’s available offers (no login needed)"
            }
          >
            {couponLoading ? "Loading…" : "View coupons"}
          </button>
        )}
      </div>


      <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900 }}>Total</span>
        <span style={{ fontWeight: 900, fontSize: 18 }}>₹{money(grandTotal)}</span>
      </div>
    </div>
  );
}
