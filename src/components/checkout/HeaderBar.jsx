// src/pages/store/checkout/components/HeaderBar.jsx
import React from "react";

export default function HeaderBar({ S, slug, totalItems, customer, isBuyNow, onBack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <div>
        <h1 style={S.h1}>Checkout</h1>

      </div>
    </div>
  );
}
