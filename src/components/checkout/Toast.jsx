// src/pages/store/checkout/components/Toast.jsx
import React from "react";

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        background: "#111",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 13,
        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
        zIndex: 9999,
        maxWidth: 320,
      }}
    >
      {toast}
    </div>
  );
}
