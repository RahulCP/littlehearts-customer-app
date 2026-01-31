// src/pages/store/checkout/hooks/useCheckoutCart.js
import { useEffect, useMemo, useState } from "react";
import { readCart, toInt, writeCart } from "./checkoutUtils";

export default function useCheckoutCart({ slug, location }) {
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

  const updateQty = (item_uid, delta) => {
    const next = cart
      .map((x) => {
        if (x.item_uid !== item_uid) return x;
        const q = toInt(x.quantity || 1, 1);
        return { ...x, quantity: Math.max(1, q + delta) };
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
