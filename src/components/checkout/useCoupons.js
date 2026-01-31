// src/pages/store/useCoupons.js
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";
import { toInt, normalizeCoupon, computeManualDiscountPreview } from "./checkoutUtils";

export default function useCoupons({
  slug,
  cart,
  step,
  subtotal,
  customerToken,
  buyer,
  address,
  setToast,
}) {
  const [couponsOpen, setCouponsOpen] = useState(false);

  // manual lane
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [manualSelected, setManualSelected] = useState(null);
  const [manualApplied, setManualApplied] = useState(null);

  // auto lane
  const [autoApplied, setAutoApplied] = useState(null);
  const [autoDiscount, setAutoDiscount] = useState(0);

  // totals
  const [discountTotal, setDiscountTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [couponLoading, setCouponLoading] = useState(false);

  // generic offers list (no code) for drawer display
  const [genericOffers, setGenericOffers] = useState([]);
  const [genericLoading, setGenericLoading] = useState(false);

  // in-flight guards
  const autoEvalInFlightRef = useRef(false);
  const lastAutoKeyRef = useRef("");

  async function fetchGenericOffers() {
    if (!slug) return [];
    setGenericLoading(true);
    try {
      const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/generic`;
      const res = await axios.get(url);
      const list = res.data?.offers || [];
      const arr = Array.isArray(list) ? list.filter(Boolean) : [];
      setGenericOffers(arr);
      return arr;
    } catch {
      setGenericOffers([]);
      return [];
    } finally {
      setGenericLoading(false);
    }
  }

  async function fetchAvailableCoupons() {
    if (!slug || !customerToken) return [];
    setCouponLoading(true);
    try {
      const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/available`;
      const headers = { Authorization: `Bearer ${customerToken}` };
      const res = await axios.get(url, { headers });
      const list = res.data?.coupons || res.data?.discounts || [];
      const arr = Array.isArray(list) ? list.filter(Boolean) : [];
      setAvailableCoupons(arr);
      return arr;
    } catch (e) {
      setAvailableCoupons([]);
      setToast?.(e?.response?.data?.error || e.message || "Failed to load coupons");
      return [];
    } finally {
      setCouponLoading(false);
    }
  }

  async function evaluateAutoOffer({ silent = true } = {}) {
    if (!slug) return null;
    if (!cart?.length) return null;

    const itemsKey = cart
      .map((x) => `${x.item_uid}:${toInt(x.quantity || 1, 1)}`)
      .sort()
      .join("|");

    const key = `${slug}::${itemsKey}::${customerToken ? "auth" : "guest"}`;
    if (lastAutoKeyRef.current === key) return null;

    if (autoEvalInFlightRef.current) return null;
    autoEvalInFlightRef.current = true;
    lastAutoKeyRef.current = key;

    setCouponLoading(true);
    try {
      const items = cart.map((x) => ({
        item_uid: x.item_uid,
        quantity: toInt(x.quantity || 1, 1),
      }));

      const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/evaluate`;
      const headers = {};
      if (customerToken) headers.Authorization = `Bearer ${customerToken}`;

      const res = await axios.post(
        url,
        { buyer, address, items, coupon_code: null, auto: true },
        { headers }
      );

      const data = res.data || {};
      const totals = data.totals || {};

      setAutoApplied(data.applied || null);
      setAutoDiscount(Number(totals.discount_total || 0));

      if (!silent && data.message) setToast?.(String(data.message));
      return data;
    } catch {
      setAutoApplied(null);
      setAutoDiscount(0);
      return null;
    } finally {
      setCouponLoading(false);
      autoEvalInFlightRef.current = false;
    }
  }

  useEffect(() => {
    if (!slug) return;
    fetchGenericOffers().catch(() => {});
    evaluateAutoOffer({ silent: true }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, cart?.length, subtotal, customerToken]);

  const manualDiscountPreview = useMemo(() => {
    const baseAfterAuto = Math.max(0, Number(subtotal) - Number(autoDiscount || 0));
    if (!manualSelected?.code) return 0;

    return computeManualDiscountPreview({
      subtotal,
      baseAfterAuto,
      rawCoupon: manualSelected,
    });
  }, [subtotal, autoDiscount, manualSelected]);

  useEffect(() => {
    const combined = Math.min(
      Number(subtotal || 0),
      Number(autoDiscount || 0) + Number(manualDiscountPreview || 0)
    );
    setDiscountTotal(combined);
    setGrandTotal(Math.max(0, Number(subtotal || 0) - combined));
  }, [subtotal, autoDiscount, manualDiscountPreview]);

  // ✅ Validate manual coupon at pay-time (eligibility), keep stacking math
  async function evaluateAtPayment({ manualCode } = {}) {
    // refresh auto once
    await evaluateAutoOffer({ silent: true });

    if (!manualCode) {
      setManualApplied(null);
      return { ok: true };
    }

    if (!slug || !cart?.length) return { ok: true };

    setCouponLoading(true);
    try {
      const items = cart.map((x) => ({
        item_uid: x.item_uid,
        quantity: toInt(x.quantity || 1, 1),
      }));

      const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/discounts/evaluate`;
      const headers = {};
      if (customerToken) headers.Authorization = `Bearer ${customerToken}`;

      const res = await axios.post(
        url,
        { buyer, address, items, coupon_code: String(manualCode).trim(), auto: false },
        { headers }
      );

      const data = res.data || {};

      // if invalid -> applied null
      if (!data.applied) {
        setManualApplied(null);
        throw new Error(data.message || "Coupon not eligible");
      }

      setManualApplied(data.applied);
      return data;
    } finally {
      setCouponLoading(false);
    }
  }

  const autoName = autoApplied?.name || "";
  const manualName = manualSelected?.name || (manualApplied?.name ?? "");

  return {
    couponsOpen,
    setCouponsOpen,

    couponLoading,

    // manual
    availableCoupons,
    fetchAvailableCoupons,
    manualSelected,
    setManualSelected,
    manualApplied,

    // auto
    autoApplied,
    autoDiscount,
    autoName,

    // totals
    manualDiscountPreview,
    discountTotal,
    grandTotal,

    // generic offers
    genericOffers,
    genericLoading,
    fetchGenericOffers,

    // actions
    evaluateAutoOffer,
    evaluateAtPayment,
    manualName,
  };
}
