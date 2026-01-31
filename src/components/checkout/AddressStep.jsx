// src/pages/store/checkout/components/steps/AddressStep.jsx
import React from "react";

export default function AddressStep({ S, address, setAddress, canGoStep3, onBack, onNext }) {
  return (
    <>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Shipping address</h2>
      <p style={{ ...S.muted, marginTop: 6 }}>Enter where you want the order delivered.</p>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>Receiver Name *</div>
          <input
            style={S.input}
            value={address.receiver_name}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_name: e.target.value }))}
            placeholder="Receiver name"
          />
        </div>
        <div style={S.field}>
          <div style={S.label}>Receiver Phone *</div>
          <input
            style={S.input}
            value={address.receiver_phone}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_phone: e.target.value }))}
            placeholder="Receiver phone"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Receiver Email (optional)</div>
          <input
            style={S.input}
            value={address.receiver_email}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_email: e.target.value }))}
            placeholder="Receiver email"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Address line 1 *</div>
          <input
            style={S.input}
            value={address.address_line1}
            onChange={(e) => setAddress((p) => ({ ...p, address_line1: e.target.value }))}
            placeholder="House, street, area"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Address line 2</div>
          <input
            style={S.input}
            value={address.address_line2}
            onChange={(e) => setAddress((p) => ({ ...p, address_line2: e.target.value }))}
            placeholder="Landmark, apartment (optional)"
          />
        </div>
      </div>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>City *</div>
          <input style={S.input} value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />
        </div>
        <div style={S.field}>
          <div style={S.label}>District</div>
          <input style={S.input} value={address.district} onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>State *</div>
          <input style={S.input} value={address.state} onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))} />
        </div>
        <div style={S.field}>
          <div style={S.label}>Pincode *</div>
          <input style={S.input} value={address.pincode} onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, maxWidth: 520 }}>
        <button style={{ ...S.btn("secondary"), width: 160 }} onClick={onBack} type="button">
          Back
        </button>
        <button style={S.btn("primary", !canGoStep3)} disabled={!canGoStep3} onClick={onNext} type="button">
          Continue
        </button>
      </div>
    </>
  );
}
