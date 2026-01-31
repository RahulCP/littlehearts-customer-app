// src/config/styleOptions.js

export const STYLE_OPTIONS = [
  { id: 101, label: "Red" },
  { id: 102, label: "Blue" },
  { id: 103, label: "Green" },
  { id: 104, label: "Gold" },
  { id: 105, label: "Silver" },
  { id: 106, label: "Black" },
  { id: 107, label: "White" },
  { id: 201, label: "Strawberry" },
  { id: 202, label: "Vanilla" },
  { id: 203, label: "Chocolate" },
  { id: 204, label: "Mango" },
  { id: 205, label: "Mint" },
  { id: 206, label: "Pineapple" },
];

export const STYLE_MAP = STYLE_OPTIONS.reduce((acc, style) => {
  acc[style.id] = style.label;
  return acc;
}, {});
