// src/pages/store/Checkout.jsx
import React, { useMemo, useState, useEffect } from "react";
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

  const [paymentMethod, setPaymentMethod] = useState("PAYTM");

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

    const receiverName = sendToDifferentPerson ? address.receiver_name : buyer.name;
    const receiverPhone = sendToDifferentPerson ? address.receiver_phone : buyer.phone;

    const receiverOk = (receiverName || "").trim().length >= 2;
    const receiverPhoneOk = (receiverPhone || "").trim().length >= 10;

    return line1Ok && cityOk && stateOk && pinOk && receiverOk && receiverPhoneOk;
  }, [address, buyer, sendToDifferentPerson]);

  /* ---------------- helpers ---------------- */
  function buildReceiver() {
    const receiver_name =
      (sendToDifferentPerson ? address.receiver_name : buyer.name) || buyer.name;
    const receiver_phone =
      (sendToDifferentPerson ? address.receiver_phone : buyer.phone) || buyer.phone;
    const receiver_email =
      (sendToDifferentPerson ? address.receiver_email : buyer.email) || buyer.email;

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

  function buildDiscountRows() {
    const rows = [];

    // AUTO lane (no code)
    if (coupons.autoApplied) {
      const amt = Number(coupons.autoDiscount || 0);
      const d = coupons.autoApplied;

      // even if FREE_GIFT => store row with amount 0 (so you can see it in DB)
      const shouldInsert = amt > 0 || String(d.discount_type || "").toUpperCase() === "FREE_GIFT";
      if (shouldInsert) {
        rows.push({
          source: "RULE", // your service uses RULE/MANUAL
          discount_id: d.id || null,
          name: d.name || "Auto Offer",
          code: null,
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

  /* ------------ order + paytm ------------ */
  async function createOrder() {
    const items = cart.map((x) => ({
      item_uid: x.item_uid, // ✅ your sales.service resolves item_uid -> product_item_id
      quantity: toInt(x.quantity || 1, 1),
    }));

    const shipping_address = buildShippingAddress();

    // for now: billing same as shipping (you can add UI later)
    const billing_address = { ...shipping_address };

    const discounts = buildDiscountRows();

    const payload = {
      buyer,
      items,

      shipping_address,
      billing_address,

      discounts, // ✅ THIS is why sales_order_discounts will now insert

      // optional fields (safe to include)
      payment_mode: paymentMethod,
      customer_note: "",
    };

    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/orders`;
    const headers = {};
    if (customerToken) headers.Authorization = `Bearer ${customerToken}`;

    const res = await axios.post(url, payload, { headers });
    return res.data; // your API returns hydrated object (order/items/addresses/discounts)
  }

  async function initiatePaytm(orderHydrated) {
    // depends on your paytm routes; usually needs order_uid + amount
    const order = orderHydrated?.order || {};
    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/paytm/initiate`;
    const headers = {};
    if (customerToken) headers.Authorization = `Bearer ${customerToken}`;

    const res = await axios.post(
      url,
      {
        order_uid: order.order_uid, // ensure your sales_orders has order_uid (UUID)
        amount: order.grand_total,
        buyer,
      },
      { headers }
    );

    return res.data;
  }

  function redirectToGateway(gw) {
    if (!gw?.redirectUrl) throw new Error("Payment gateway response missing redirectUrl");
    const method = (gw.method || "POST").toUpperCase();
    const params = gw.params || {};

    const form = document.createElement("form");
    form.method = method;
    form.action = gw.redirectUrl;

    Object.entries(params).forEach(([k, v]) => {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = String(v ?? "");
      form.appendChild(inp);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

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
      await coupons.evaluateAtPayment?.({
        manualCode: coupons.manualSelected?.code || null,
      });

      const orderHydrated = await createOrder();

      if (paymentMethod === "PAYTM") {
        const gw = await initiatePaytm(orderHydrated);
        redirectToGateway(gw);
        return;
      }

      setToast("Payment method not wired yet.");
    } catch (e) {
      console.error(e);
      setToast(e?.response?.data?.error || e?.response?.data?.message || e.message || "Payment failed");
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
