// src/pages/store/CheckoutDesktop.jsx
import React from "react";

import StepPills from "./StepPills";
import ContactStep from "./ContactStep";
import AddressStep from "./AddressStep";
import ReviewStep from "./ReviewStep";
import OrderSummary from "./OrderSummary";

export default function CheckoutDesktop({
  S,
  step,
  setStep,

  buyer,
  setBuyer,
  address,
  setAddress,

  paymentMethod,
  setPaymentMethod,

  cart,
  subtotal,
  totalItems,
  updateQty,

  customerToken,
  coupons,

  canGoStep2,
  canGoStep3,

  loading,
  onPayNow,
  onOpenCoupons,
}) {
  return (
    <>
      <StepPills S={S} step={step} />

      <div style={{ marginTop: 14, ...S.grid }}>
        {/* Left */}
        <div style={S.card}>
          {step === 1 && (
            <ContactStep
              S={S}
              buyer={buyer}
              setBuyer={setBuyer}
              canGoStep2={canGoStep2}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <AddressStep
              S={S}
              address={address}
              setAddress={setAddress}
              canGoStep3={canGoStep3}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <ReviewStep
              S={S}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              loading={loading}
              onBack={() => setStep(2)}
              onPayNow={onPayNow}
            />
          )}
        </div>

        {/* Right */}
        <OrderSummary
          S={S}
          cart={cart}
          totalItems={totalItems}
          subtotal={subtotal}
          updateQty={updateQty}
          customerToken={customerToken}
          step={step}
          couponLoading={coupons.couponLoading}
          availableCoupons={coupons.availableCoupons}
          onOpenCoupons={onOpenCoupons}
          autoName={coupons.autoName}
          autoApplied={coupons.autoApplied}
          autoDiscount={coupons.autoDiscount}
          manualName={coupons.manualName}
          manualSelected={coupons.manualSelected}
          onRemoveManual={() => coupons.setManualSelected(null)}
          manualDiscountPreview={coupons.manualDiscountPreview}
          discountTotal={coupons.discountTotal}
          grandTotal={coupons.grandTotal}
        />
      </div>
    </>
  );
}
