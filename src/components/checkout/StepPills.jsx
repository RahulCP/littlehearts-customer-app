// src/pages/store/checkout/components/StepPills.jsx
import React from "react";

export default function StepPills({ S, step }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
      <div style={S.stepPill(step === 1)}>1. Contact</div>
      <div style={S.stepPill(step === 2)}>2. Address</div>
      <div style={S.stepPill(step === 3)}>3. Review & Pay</div>
    </div>
  );
}
