// src/pages/store/checkout/hooks/useCheckoutCart.js
import { useEffect, useMemo, useState } from "react";
import { readCart, toInt, writeCart } from "./checkoutUtils";
import { availabilityMessage, checkRequestedQuantity } from "../../utils/cartAvailability";

export default function useCheckoutCart({ slug, location, setToast }) {
  const [cart, setCart] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);

  useEffect(() => {
    // ✅ if coming from ProductDetails "Buy Now", use only passed items (do NOT read localStorage cart)
    const buyNow = Boolean(location?.state?.buyNow);
    const buyNowItems = location?.state?.buyNowItems;

    if (buyNow && Array.isArray(buyNowItems) && buyNowItems.length) {
      setIsBuyNow(true);
      setCart(buyNowItems);
    } else {
      setIsBuyNow(false);
      setCart(readCart(slug));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      const qty = toInt(line?.quantity || 1, 1);
      const price = Number(line?.selling_price || 0);
      return sum + qty * price;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, line) => sum + toInt(line?.quantity || 1, 1), 0);
  }, [cart]);

  const updateQty = async (item_uid, delta) => {
    const target = cart.find((x) => x.item_uid === item_uid);
    if (!target) return;

    const currentQty = toInt(target.quantity || 1, 1);
    const requestedQty = Math.max(1, currentQty + delta);
    let verifiedAvailableQty = null;

    if (delta > 0) {
      try {
        const result = await checkRequestedQuantity(slug, target, requestedQty);
        const checked = result?.items?.find((x) => String(x.item_uid) === String(item_uid));
        const availableQty = Number(checked?.available_qty ?? target.available_qty ?? target.stocked_quantity ?? 0);
        verifiedAvailableQty = Number.isFinite(availableQty) ? availableQty : null;

        if (!result?.ok) {
          setToast?.(availabilityMessage(result) || "Requested quantity is not available.");
          if (Number.isFinite(availableQty)) {
            const cappedQty = Math.max(0, availableQty);
            const capped = cart
              .map((x) => (x.item_uid === item_uid ? { ...x, quantity: cappedQty, available_qty: cappedQty, stocked_quantity: cappedQty } : x))
              .filter((x) => Number(x.quantity || 0) > 0);
            setCart(capped);
            if (!isBuyNow) writeCart(slug, capped);
          }
          return;
        }
      } catch (e) {
        console.error("[availability] checkout qty check failed", e);
        setToast?.("Could not verify stock. Please try again.");
        return;
      }
    }

    const next = cart
      .map((x) => {
        if (x.item_uid !== item_uid) return x;
        const q = toInt(x.quantity || 1, 1);
        const stock = Number(verifiedAvailableQty ?? x.available_qty ?? x.stocked_quantity ?? 0);
        const hasStock = Number.isFinite(stock) && stock > 0;
        const requested = Math.max(1, q + delta);
        const quantity = hasStock ? Math.min(requested, stock) : requested;
        return { ...x, quantity, available_qty: hasStock ? stock : x.available_qty, stocked_quantity: hasStock ? stock : x.stocked_quantity };
      })
      .filter(Boolean);

    setCart(next);

    // ✅ only persist when this checkout is using localStorage cart
    if (!isBuyNow) {
      writeCart(slug, next);
    }
  };

  return { cart, setCart, isBuyNow, subtotal, totalItems, updateQty };
}
