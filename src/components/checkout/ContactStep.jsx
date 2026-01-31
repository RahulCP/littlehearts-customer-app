// src/pages/store/checkout/components/steps/ContactStep.jsx
import React from "react";

export default function ContactStep({ S, buyer, setBuyer, canGoStep2, onNext }) {
  return (
    <>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Contact details</h2>
      <p style={{ ...S.muted, marginTop: 6 }}>We’ll use this to send order updates.</p>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>Full name *</div>
          <input style={S.input} value={buyer.name} onChange={(e) => setBuyer((p) => ({ ...p, name: e.target.value }))} />
        </div>

        <div style={S.field}>
          <div style={S.label}>Phone *</div>
          <input style={S.input} value={buyer.phone} onChange={(e) => setBuyer((p) => ({ ...p, phone: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Email (optional)</div>
          <input style={S.input} value={buyer.email} onChange={(e) => setBuyer((p) => ({ ...p, email: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, maxWidth: 420 }}>
        <button style={S.btn("primary", !canGoStep2)} disabled={!canGoStep2} onClick={onNext} type="button">
          Continue
        </button>
      </div>
    </>
  );
}
