// src/pages/store/Checkout.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { API_BASE_URL } from "./../../config/constants";
import CouponsDrawer from "./../coupons/CouponsDrawer";

import { S } from "./checkoutStyles";
import { normalizeCoupon, toInt } from "./checkoutUtils";

import useToast from "./useToast";
import useCheckoutCart from "./useCheckoutCart";
import useCustomerSession from "./useCustomerSession";
import useCoupons from "./useCoupons";

import Toast from "./Toast";
import HeaderBar from "./HeaderBar";

import CheckoutDesktop from "./CheckoutDesktop";
import CheckoutMobile from "./CheckoutMobile";

/* ---------------- responsive helper ---------------- */
function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

/* ---------------- main ---------------- */
export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);

  const { toast, setToast } = useToast();

  // desktop steps (mobile ignores this)
  const [step, setStep] = useState(1); // 1 contact, 2 address, 3 review/pay
  const [loading, setLoading] = useState(false);

  // Contact
  const [buyer, setBuyer] = useState({ name: "", phone: "", email: "" });

  // Address
  const [address, setAddress] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // ✅ NEW (mobile UX): if false, receiver fields are hidden and we’ll use buyer as receiver
  const [sendToDifferentPerson, setSendToDifferentPerson] = useState(false);
  const previousBuyerRef = useRef({ name: "", phone: "", email: "" });

  // ✅ PhonePe ONLY
  const [paymentMethod, setPaymentMethod] = useState("PHONEPE");

  // cart
  const { cart, isBuyNow, subtotal, totalItems, updateQty } = useCheckoutCart({
    slug,
    location,
  });

  // customer session
  const { customerToken, customer } = useCustomerSession({
    slug,
    setBuyer,
    setAddress,
  });

  useEffect(() => {
    const prev = previousBuyerRef.current;
    setAddress((current) => ({
      ...current,
      receiver_name:
        !current.receiver_name || current.receiver_name === prev.name
          ? buyer.name
          : current.receiver_name,
      receiver_phone:
        !current.receiver_phone || current.receiver_phone === prev.phone
          ? buyer.phone
          : current.receiver_phone,
      receiver_email:
        !current.receiver_email || current.receiver_email === prev.email
          ? buyer.email
          : current.receiver_email,
    }));
    previousBuyerRef.current = { name: buyer.name, phone: buyer.phone, email: buyer.email };
  }, [buyer.name, buyer.phone, buyer.email]);

  // coupons + totals
  const coupons = useCoupons({
    slug,
    cart,
    step: isMobile ? 3 : step,
    subtotal,
    customerToken,
    buyer,
    address,
    setToast,
  });

  const canGoStep2 = useMemo(() => {
    const nameOk = buyer.name.trim().length >= 2;
    const phoneOk = buyer.phone.trim().length >= 10;
    return nameOk && phoneOk;
  }, [buyer]);

  const canGoStep3 = useMemo(() => {
    const line1Ok = address.address_line1.trim().length >= 5;
    const cityOk = address.city.trim().length >= 2;
    const stateOk = address.state.trim().length >= 2;
    const pinOk = address.pincode.trim().length >= 5;

    const receiverName = address.receiver_name || buyer.name;
    const receiverPhone = address.receiver_phone || buyer.phone;

    const receiverOk = (receiverName || "").trim().length >= 2;
    const receiverPhoneOk = (receiverPhone || "").trim().length >= 10;

    return line1Ok && cityOk && stateOk && pinOk && receiverOk && receiverPhoneOk;
  }, [address, buyer]);

  /* ---------------- helpers ---------------- */
  function buildReceiver() {
    const receiver_name = address.receiver_name || buyer.name;
    const receiver_phone = address.receiver_phone || buyer.phone;
    const receiver_email = address.receiver_email || buyer.email;

    return { receiver_name, receiver_phone, receiver_email };
  }

  function buildShippingAddress() {
    const { receiver_name, receiver_phone, receiver_email } = buildReceiver();

    return {
      name: receiver_name,
      phone: receiver_phone,
      email: receiver_email,
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      district: address.district || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    };
  }

  function buildDiscountRows({ autoData } = {}) {
    const rows = [];
    const autoApplied = autoData?.applied || coupons.autoApplied;
    const autoDiscount = Number(autoData?.totals?.discount_total ?? coupons.autoDiscount ?? 0);

    // AUTO lane (no code)
    if (autoApplied) {
      const amt = autoDiscount;
      const d = autoApplied;

      // even if FREE_GIFT => store row with amount 0 (so you can see it in DB)
      const shouldInsert = amt > 0 || String(d.discount_type || "").toUpperCase() === "FREE_GIFT";
      if (shouldInsert) {
        rows.push({
          source: "RULE", // your service uses RULE/MANUAL
          discount_id: d.id || null,
          name: d.name || "Auto Offer",
          code: d.code || null,
          discount_type: d.discount_type || "FLAT",
          discount_value: Number(d.discount_value || 0),
          amount_applied: amt,
          note: "AUTO",
          meta: d.free_gift_item_uid
            ? { free_gift_item_uid: d.free_gift_item_uid, free_gift_note: d.free_gift_note }
            : null,
        });
      }
    }

    // MANUAL lane (selected coupon)
    if (coupons.manualSelected?.code) {
      const amt = Number(coupons.manualDiscountPreview || 0);
      const d = coupons.manualSelected;

      const shouldInsert = amt > 0 || String(d.discount_type || "").toUpperCase() === "FREE_GIFT";
      if (shouldInsert) {
        rows.push({
          source: "MANUAL",
          discount_id: d.id || null,
          name: d.name || "Coupon",
          code: String(d.code || "").trim(),
          discount_type: d.discount_type || "FLAT",
          discount_value: Number(d.discount_value || 0),
          amount_applied: amt,
          note: "MANUAL",
          meta: null,
        });
      }
    }

    return rows;
  }

  /* ------------ order create ------------ */
  async function createOrder({ couponEvaluation } = {}) {
    const items = cart.map((x) => ({
      item_uid: x.item_uid, // ✅ your sales.service resolves item_uid -> product_item_id
      quantity: toInt(x.quantity || 1, 1),
    }));

    const shipping_address = buildShippingAddress();
    const billing_address = { ...shipping_address }; // for now: same as shipping
    const discounts = buildDiscountRows({ autoData: couponEvaluation?.autoData });

    const payload = {
      buyer,
      items,
      shipping_address,
      billing_address,
      discounts,
      payment_mode: "PHONEPE",
      customer_note: "",
    };

    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/orders`;
    const headers = {};
    if (customerToken) headers.Authorization = `Bearer ${customerToken}`;

    const res = await axios.post(url, payload, { headers });
    return res.data;
  }

  /* ------------ PhonePe ONLY (aligned) ------------ */
  async function getPhonePeToken() {
    const savedToken = localStorage.getItem("phonepe_auth_token");
    const savedExp = Number(localStorage.getItem("phonepe_auth_token_expires_at") || 0);
    const now = Math.floor(Date.now() / 1000);

    // 30s buffer
    if (savedToken && savedExp && now < savedExp - 30) return savedToken;

    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/phonepe/fetchAuthToken`;
    const { data } = await axios.post(url);

    const token = data?.access_token;
    const exp = data?.expires_at;

    if (!token) throw new Error("PhonePe auth token missing in response.");

    localStorage.setItem("phonepe_auth_token", token);
    if (exp) localStorage.setItem("phonepe_auth_token_expires_at", String(exp));

    return token;
  }

  async function initiatePhonePePayment(orderHydrated) {
    const order = orderHydrated?.order || {};

    // pick stable id for merchantOrderId
    const transactionId = order.order_uid || order.order_id || orderHydrated?.order_uid;
    if (!transactionId) throw new Error("Missing order id to send as merchantOrderId.");

    const accessToken = await getPhonePeToken();

    // where PhonePe should redirect back after payment
    const redirectUrl =
      `${window.location.origin}/store/${encodeURIComponent(slug)}/confirmation?transactionId=${encodeURIComponent(
        transactionId
      )}`;

    const payload = {
      amount: Number(order.grand_total || 0), // rupees; backend converts to paise
      transactionId,
      customerMobile: buyer.phone,
      redirectUrl,
      email: buyer.email,
      name: buyer.name,
      accessToken,
    };

    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/phonepe/initiate-payment`;
    const { data } = await axios.post(url, payload);

    // Try multiple known shapes
    const direct =
      data?.redirectUrl ||
      data?.data?.redirectUrl ||
      data?.data?.instrumentResponse?.redirectInfo?.url ||
      data?.instrumentResponse?.redirectInfo?.url;

    if (!direct) {
      console.error("[phonepe] unexpected response", data);
      throw new Error("PhonePe did not return a redirect URL.");
    }

    window.location.href = direct;
  }

  /* ------------ pay now ------------ */
  const onPayNow = async () => {
    try {
      if (!cart.length) return setToast("Cart is empty.");
      if (!canGoStep2) {
        setToast("Please fill contact details.");
        if (!isMobile) setStep(1);
        return;
      }
      if (!canGoStep3) {
        setToast("Please fill address details.");
        if (!isMobile) setStep(2);
        return;
      }

      setLoading(true);

      // ✅ optional: re-evaluate auto at payment (fresh)
      const couponEvaluation = await coupons.evaluateAtPayment?.({
        manualCode: coupons.manualSelected?.code || null,
      });

      const orderHydrated = await createOrder({ couponEvaluation });

      // ✅ PhonePe ONLY
      await initiatePhonePePayment(orderHydrated);
    } catch (e) {
      console.error(e);
      setToast(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e.message ||
          "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div style={S.page}>
        <h1 style={S.h1}>Checkout</h1>
        <p style={{ ...S.muted, marginTop: 8 }}>Your cart is empty.</p>
        <div style={{ marginTop: 14, maxWidth: 320 }}>
          <button style={S.btn("secondary")} onClick={() => navigate(-1)} type="button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const onOpenCoupons = async () => {
    // ✅ Always open (guest can see generic)
    if (customerToken && !coupons.availableCoupons.length) {
      await coupons.fetchAvailableCoupons();
    }
    coupons.setCouponsOpen(true);
  };

  return (
    <div style={S.page}>
      <Toast toast={toast} />

      <HeaderBar
        S={S}
        slug={slug}
        totalItems={totalItems}
        customer={customer}
        isBuyNow={isBuyNow}
        onBack={() => navigate(-1)}
      />

      {isMobile ? (
        <CheckoutMobile
          S={S}
          cart={cart}
          subtotal={subtotal}
          totalItems={totalItems}
          updateQty={updateQty}
          loading={loading}
          onPayNow={onPayNow}
          onOpenCoupons={onOpenCoupons}
          // form
          buyer={buyer}
          setBuyer={setBuyer}
          address={address}
          setAddress={setAddress}
          sendToDifferentPerson={sendToDifferentPerson}
          setSendToDifferentPerson={setSendToDifferentPerson}
          // keep props (but PhonePe only)
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          // validations + totals
          canGoStep2={canGoStep2}
          canGoStep3={canGoStep3}
          coupons={coupons}
          customerToken={customerToken}
        />
      ) : (
        <CheckoutDesktop
          S={S}
          step={step}
          setStep={setStep}
          loading={loading}
          onPayNow={onPayNow}
          onOpenCoupons={onOpenCoupons}
          // form
          buyer={buyer}
          setBuyer={setBuyer}
          address={address}
          setAddress={setAddress}
          sendToDifferentPerson={sendToDifferentPerson}
          setSendToDifferentPerson={setSendToDifferentPerson}
          // keep props (but PhonePe only)
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          // cart + summary
          cart={cart}
          subtotal={subtotal}
          totalItems={totalItems}
          updateQty={updateQty}
          // validations + totals
          canGoStep2={canGoStep2}
          canGoStep3={canGoStep3}
          coupons={coupons}
          customerToken={customerToken}
        />
      )}

      {/* drawer shared for both */}
      <CouponsDrawer
        open={coupons.couponsOpen}
        onClose={() => coupons.setCouponsOpen(false)}
        slug={slug}
        customerToken={customerToken}
        coupons={coupons.availableCoupons}
        onNeedRefresh={coupons.fetchAvailableCoupons}
        selectedId={coupons.manualSelected?.id || null}
        onPickCoupon={(couponObj) => {
          const normalized = normalizeCoupon(couponObj);
          coupons.setManualSelected(normalized);
          coupons.setCouponsOpen(false);
        }}
        genericOffers={coupons.genericOffers}
        genericLoading={coupons.genericLoading}
        autoApplied={coupons.autoApplied}
        autoDiscount={coupons.autoDiscount}
      />
    </div>
  );
}
