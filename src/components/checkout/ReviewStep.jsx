// src/pages/store/checkout/components/steps/ReviewStep.jsx
import React from "react";

export default function ReviewStep({
  S,
  buyer,
  address,
  sendToDifferentPerson,
  loading,
  onBack,
  onPayNow,
}) {
  const recipientName = address?.receiver_name || buyer?.name;
  const recipientPhone = address?.receiver_phone || buyer?.phone;
  const recipientEmail = address?.receiver_email || buyer?.email;

  return (
    <>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Review & Payment</h2>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 8 }}>Mailing details</div>
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            <div><strong>{recipientName || "-"}</strong></div>
            <div style={S.muted}>{recipientPhone || "-"}</div>
            {recipientEmail ? <div style={S.muted}>{recipientEmail}</div> : null}
            <div style={S.muted}>
              {[address?.address_line1, address?.address_line2, address?.city, address?.district, address?.state, address?.pincode]
                .filter(Boolean)
                .join(", ") || "-"}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #d9f0e5",
            borderRadius: 12,
            padding: 12,
            background: "#f8fffb",
            color: "#0f3f32",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Secured payment by PhonePe. Your order total and offers are verified before payment.
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
