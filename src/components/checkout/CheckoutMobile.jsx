// src/pages/store/CheckoutMobile.jsx
import React, { useMemo, useState } from "react";
import { money, toInt } from "./checkoutUtils";

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ S, label, value, onChange, placeholder = "" }) {
  return (
    <div style={S.field}>
      <div style={S.label}>{label}</div>
      <input style={S.input} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export default function CheckoutMobile({
  S,

  cart,
  subtotal,
  totalItems,
  updateQty,

  buyer,
  setBuyer,

  address,
  setAddress,

  sendToDifferentPerson,
  setSendToDifferentPerson,

  paymentMethod,
  setPaymentMethod,

  customerToken,
  coupons,

  canGoStep2,
  canGoStep3,

  loading,
  onPayNow,
  onOpenCoupons,
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  const receiverName = sendToDifferentPerson ? address.receiver_name : buyer.name;
  const receiverPhone = sendToDifferentPerson ? address.receiver_phone : buyer.phone;

  const showErrors = useMemo(() => {
    // simple: show red hint only when Pay is clicked? for now just show status text
    return false;
  }, []);

  return (
    <div style={{ marginTop: 12 }}>
      {/* Shopify-like collapsible summary */}
      <details
        open={summaryOpen}
        onToggle={(e) => setSummaryOpen(e.currentTarget.open)}
        style={{
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 10,
          background: "#fff",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      >
        <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Order summary</div>
          <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 16 }}>₹{money(coupons.grandTotal)}</div>
        </summary>

        <div style={{ marginTop: 10, display: "grid", gap: 10, maxHeight: 280, overflow: "auto" }}>
          {cart.map((x) => (
            <div
              key={x.item_uid}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                padding: 10,
                border: "1px solid #eee",
                borderRadius: 12,
                background: "#fafafa",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>{x.product_label || "Product"}</div>

                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => updateQty(x.item_uid, -1)} style={S.miniBtn} type="button">
                    –
                  </button>
                  <div style={{ fontWeight: 900, width: 26, textAlign: "center" }}>
                    {toInt(x.quantity || 1, 1)}
                  </div>
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

        {Number(coupons.autoDiscount || 0) > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={S.muted}>{coupons.autoName ? `Offer: ${coupons.autoName}` : "Offer"}</span>
            <strong>- ₹{money(coupons.autoDiscount)}</strong>
          </div>
        ) : null}

        {Number(coupons.manualDiscountPreview || 0) > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={S.muted}>{coupons.manualName ? `Coupon: ${coupons.manualName}` : "Coupon"}</span>
            <strong>- ₹{money(coupons.manualDiscountPreview)}</strong>
          </div>
        ) : null}

        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 900 }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: 18 }}>₹{money(coupons.grandTotal)}</span>
        </div>
      </details>

      {/* Main form card */}
      <div style={{ ...S.card, marginTop: 12 }}>
        {/* Coupon row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 900 }}>Coupons</div>

          {coupons.manualSelected?.code ? (
            <button
              style={S.link}
              onClick={() => coupons.setManualSelected(null)}
              type="button"
            >
              Remove coupon
            </button>
          ) : (
            <button style={S.link} onClick={onOpenCoupons} type="button">
              {coupons.couponLoading ? "Loading…" : "View offers"}
            </button>
          )}
        </div>

        {/* Contact */}
        <Section title="Contact">
          <div style={S.row}>
            <Field
              S={S}
              label="Full name *"
              value={buyer.name}
              onChange={(e) => setBuyer((p) => ({ ...p, name: e.target.value }))}
            />
            <Field
              S={S}
              label="Phone *"
              value={buyer.phone}
              onChange={(e) => setBuyer((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <Field
              S={S}
              label="Email (optional)"
              value={buyer.email}
              onChange={(e) => setBuyer((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          {!canGoStep2 ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>
              Please enter name and phone.
            </div>
          ) : null}
        </Section>

        {/* Receiver toggle */}
        <div style={{ marginTop: 14 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 900, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={sendToDifferentPerson}
              onChange={(e) => setSendToDifferentPerson(e.target.checked)}
            />
            Sending to a different person
          </label>
        </div>

        {/* Receiver (optional) */}
        {sendToDifferentPerson ? (
          <Section title="Receiver">
            <div style={S.row}>
              <Field
                S={S}
                label="Receiver name *"
                value={address.receiver_name}
                onChange={(e) => setAddress((p) => ({ ...p, receiver_name: e.target.value }))}
              />
              <Field
                S={S}
                label="Receiver phone *"
                value={address.receiver_phone}
                onChange={(e) => setAddress((p) => ({ ...p, receiver_phone: e.target.value }))}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <Field
                S={S}
                label="Receiver email (optional)"
                value={address.receiver_email}
                onChange={(e) => setAddress((p) => ({ ...p, receiver_email: e.target.value }))}
              />
            </div>
          </Section>
        ) : (
          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Receiver will be: <strong>{receiverName || "—"}</strong> • <strong>{receiverPhone || "—"}</strong>
          </div>
        )}

        {/* Address */}
        <Section title="Shipping address">
          <div>
            <Field
              S={S}
              label="Address line 1 *"
              value={address.address_line1}
              onChange={(e) => setAddress((p) => ({ ...p, address_line1: e.target.value }))}
              placeholder="House, street, area"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <Field
              S={S}
              label="Address line 2"
              value={address.address_line2}
              onChange={(e) => setAddress((p) => ({ ...p, address_line2: e.target.value }))}
              placeholder="Landmark, apartment (optional)"
            />
          </div>

          <div style={{ marginTop: 10, ...S.row }}>
            <Field
              S={S}
              label="City *"
              value={address.city}
              onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
            />
            <Field
              S={S}
              label="District"
              value={address.district}
              onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
            />
          </div>

          <div style={{ marginTop: 10, ...S.row }}>
            <Field
              S={S}
              label="State *"
              value={address.state}
              onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
            />
            <Field
              S={S}
              label="Pincode *"
              value={address.pincode}
              onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))}
            />
          </div>

          {!canGoStep3 ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>
              Please fill delivery address + receiver details.
            </div>
          ) : null}
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <label
            style={{
              border: paymentMethod === "PAYTM" ? "1px solid #0f766e" : "1px solid #ddd",
              background: paymentMethod === "PAYTM" ? "#e0f2f1" : "#fff",
              padding: 12,
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 800,
            }}
          >
            <input type="radio" checked={paymentMethod === "PAYTM"} onChange={() => setPaymentMethod("PAYTM")} />
            Paytm (Card / UPI / Wallet)
            <span style={{ marginLeft: "auto", color: "#555", fontWeight: 700, fontSize: 12 }}>Recommended</span>
          </label>

          <label style={{ border: "1px solid #eee", padding: 12, borderRadius: 12, opacity: 0.6, marginTop: 10 }}>
            <input type="radio" disabled />
            Cash on Delivery (Coming soon)
          </label>
        </Section>

        {/* Pay */}
        <div style={{ marginTop: 14 }}>
          <button style={S.btn("primary", loading)} disabled={loading} onClick={onPayNow} type="button">
            {loading ? "Processing..." : `Pay ₹${money(coupons.grandTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
