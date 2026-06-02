import axios from "axios";
import { API_BASE_URL } from "../config/constants";

function toQty(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : 1;
}

export function availabilityMessage(result) {
  const issue = result?.issues?.[0];
  if (!issue) return "";
  const name = issue.product_label || "Item";
  const available = Number(issue.available_qty || 0);
  if (available <= 0) return `${name} is out of stock.`;
  return `${name}: only ${available} available.`;
}

export async function checkCartAvailability(slug, cartItems = []) {
  if (!slug || !Array.isArray(cartItems) || !cartItems.length) {
    return { ok: true, items: [], issues: [] };
  }

  const items = cartItems
    .map((line) => ({
      item_uid: line?.item_uid,
      quantity: toQty(line?.quantity || 1),
    }))
    .filter((line) => line.item_uid);

  if (!items.length) return { ok: true, items: [], issues: [] };

  const { data } = await axios.post(
    `${API_BASE_URL}/store/${encodeURIComponent(slug)}/cart/availability`,
    { items }
  );
  return data || { ok: true, items: [], issues: [] };
}

export async function checkRequestedQuantity(slug, line, quantity) {
  const result = await checkCartAvailability(slug, [
    { ...line, quantity: toQty(quantity) },
  ]);
  return result;
}
