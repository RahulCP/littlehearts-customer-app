// src/pages/store/checkout/components/steps/ReviewStep.jsx
import React from "react";

export default function ReviewStep({ S, paymentMethod, setPaymentMethod, loading, onBack, onPayNow }) {
  return (
    <>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Review & Payment</h2>
      <p style={{ ...S.muted, marginTop: 6 }}>
        Auto offer (no code) and manual coupon (selected) can apply together. Final discount will be verified at payment.
      </p>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 8 }}>Payment method</div>

        <div style={{ display: "grid", gap: 10 }}>
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

          <label style={{ border: "1px solid #eee", padding: 12, borderRadius: 12, opacity: 0.6 }}>
            <input type="radio" disabled />
            Cash on Delivery (Coming soon)
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, maxWidth: 520 }}>
        <button style={{ ...S.btn("secondary"), width: 160 }} onClick={onBack} type="button">
          Back
        </button>
        <button style={S.btn("primary", loading)} disabled={loading} onClick={onPayNow} type="button">
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </>
  );
}
