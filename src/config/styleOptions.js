// src/config/styleOptions.js

export const STYLE_OPTIONS = [
  { id: 101, label: "Red", hex: "#D32F2F" },
  { id: 102, label: "Blue", hex: "#1976D2" },
  { id: 103, label: "Green", hex: "#2E7D32" },
  { id: 104, label: "Gold", hex: "#D4AF37" },
  { id: 105, label: "Silver", hex: "#C0C0C0" },
  { id: 106, label: "Black", hex: "#111111" },
  { id: 107, label: "White", hex: "#FFFFFF" },
  { id: 108, label: "Yellow", hex: "#FBC02D" },
  { id: 109, label: "Orange", hex: "#F57C00" },
  { id: 110, label: "Pink", hex: "#E91E63" },
  { id: 111, label: "Purple", hex: "#7B1FA2" },
  { id: 112, label: "Brown", hex: "#795548" },
  { id: 113, label: "Grey", hex: "#757575" },
  { id: 114, label: "Cream", hex: "#F5E6C8" },
  { id: 115, label: "Maroon", hex: "#800000" },
  { id: 116, label: "Teal", hex: "#00897B" },
  { id: 117, label: "Navy", hex: "#0D47A1" },
  { id: 118, label: "Beige", hex: "#D6C6A8" },
  { id: 119, label: "Rose Gold", hex: "#B76E79" },
  { id: 120, label: "Multicolor", hex: "linear-gradient(135deg,#D32F2F 0 25%,#FBC02D 25% 50%,#2E7D32 50% 75%,#1976D2 75%)" },
];

const LEGACY_STYLE_ALIASES = [
  { id: 201, label: "Pink", hex: "#E91E63" },
  { id: 202, label: "Cream", hex: "#F5E6C8" },
  { id: 203, label: "Brown", hex: "#795548" },
  { id: 204, label: "Orange", hex: "#F57C00" },
  { id: 205, label: "Mint Green", hex: "#98D8B1" },
  { id: 206, label: "Yellow", hex: "#FBC02D" },
];

const STYLE_LOOKUP = [...STYLE_OPTIONS, ...LEGACY_STYLE_ALIASES];

export const STYLE_MAP = STYLE_LOOKUP.reduce((acc, style) => {
  acc[style.id] = style.label;
  return acc;
}, {});

export const STYLE_HEX_MAP = STYLE_LOOKUP.reduce((acc, style) => {
  acc[style.id] = style.hex;
  return acc;
}, {});

export const getStyleMeta = (id) =>
  STYLE_LOOKUP.find((style) => String(style.id) === String(id)) || null;
