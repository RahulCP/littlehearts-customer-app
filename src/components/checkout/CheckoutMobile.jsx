// src/pages/store/CheckoutMobile.jsx
import React from "react";
import { money, toInt } from "./checkoutUtils";
import { buildImageUrl } from "../../utils/imageHelpers";
import { INDIAN_STATES, KERALA_DISTRICTS, isKerala } from "../../constants/addressOptions";
import { getStyleMeta } from "../../config/styleOptions";

function colorDotStyle(hex) {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: hex || "#fff",
    border: "1px solid rgba(0,0,0,0.25)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45)",
    display: "inline-block",
    flex: "0 0 auto",
  };
}

function colorLabel(line) {
  const meta = getStyleMeta(line?.style_id);
  const label = meta?.label || line?.style_label || "";
  const hex = meta?.hex || line?.style_hex || "";
  return label ? { label, hex } : null;
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ S, label, value, onChange, placeholder = "" }) {
  return (
    <div style={S.field}>
      <div style={S.label}>{label}</div>
      <input style={S.input} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ S, label, value, onChange, children }) {
  return (
    <div style={S.field}>
      <div style={S.label}>{label}</div>
      <select style={{ ...S.input, background: "#fff" }} value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
}

function pickCartImage(line) {
  return (
    line?.image ||
    line?.image_key ||
    line?.storageKey ||
    (Array.isArray(line?.images) ? line.images[0] : "") ||
    ""
  );
}

export default function CheckoutMobile({
  S,

  cart,
  subtotal,
  totalItems,
  updateQty,

  buyer,
  setBuyer,

  address,
  setAddress,

  sendToDifferentPerson,
  setSendToDifferentPerson,
  paymentMethod,
  setPaymentMethod,

  customerToken,
  coupons,

  canGoStep2,
  canGoStep3,

  loading,
  onPayNow,
  onOpenCoupons,
}) {
  return (
    <div style={{ marginTop: 12 }}>
      {/* Always-open order summary */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 10,
          background: "#fff",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Order summary</div>
          <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 16 }}>₹{money(coupons.grandTotal)}</div>
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 10, maxHeight: 280, overflow: "auto" }}>
          {cart.map((x) => {
            const imgSrc = buildImageUrl(pickCartImage(x));
            const color = colorLabel(x);

            return (
              <div
                key={x.item_uid}
                style={{
                  display: "grid",
                  gridTemplateColumns: "54px 1fr auto",
                  gap: 10,
                  padding: 10,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "#fafafa",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#f3f4f6",
                    border: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={x.product_label || "Product"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <span style={{ fontSize: 10, color: "#777", fontWeight: 800 }}>No image</span>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{x.product_label || "Product"}</div>
                  {color ? (
                    <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555", fontWeight: 800 }}>
                      {color.hex ? <span style={colorDotStyle(color.hex)} /> : null}
                      {color.label}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => updateQty(x.item_uid, -1)} style={S.miniBtn} type="button">
                      –
                    </button>
                    <div style={{ fontWeight: 900, width: 26, textAlign: "center" }}>
                      {toInt(x.quantity || 1, 1)}
                    </div>
                    <button onClick={() => updateQty(x.item_uid, +1)} style={S.miniBtn} type="button">
                      +
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>₹{money(x.selling_price)}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, marginTop: 6 }}>
                    ₹{money(Number(x.selling_price || 0) * toInt(x.quantity || 1, 1))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={S.muted}>Subtotal</span>
          <strong>₹{money(subtotal)}</strong>
        </div>

        {Number(coupons.autoDiscount || 0) > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={S.muted}>{coupons.autoName ? `Auto offer: ${coupons.autoName}` : "Auto offer"}</span>
            <strong>- ₹{money(coupons.autoDiscount)}</strong>
          </div>
        ) : null}

        {Number(coupons.manualDiscountPreview || 0) > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={S.muted}>{coupons.manualName ? `Coupon: ${coupons.manualName}` : "Coupon"}</span>
            <strong>- ₹{money(coupons.manualDiscountPreview)}</strong>
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={S.muted}>Offers</span>
          <button style={S.link} onClick={onOpenCoupons} type="button">
            View offers
          </button>
        </div>

        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 900 }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: 18 }}>₹{money(coupons.grandTotal)}</span>
        </div>
      </div>

      {/* Main form card */}
      <div style={{ ...S.card, marginTop: 12 }}>
        <Section title="Contact Details">
          <div style={S.row}>
            <Field
              S={S}
              label="Full name *"
              value={buyer.name}
              onChange={(e) => setBuyer((p) => ({ ...p, name: e.target.value }))}
            />
            <Field
              S={S}
              label="Phone *"
              value={buyer.phone}
              onChange={(e) => setBuyer((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <Field
              S={S}
              label="Email (optional)"
              value={buyer.email}
              onChange={(e) => setBuyer((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          {!canGoStep2 ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>
              Please enter contact name and phone.
            </div>
          ) : null}
        </Section>

        <Section title="Mailing Details">
          <div style={S.row}>
            <Field
              S={S}
              label="Recipient name *"
              value={address.receiver_name}
              onChange={(e) => setAddress((p) => ({ ...p, receiver_name: e.target.value }))}
            />
            <Field
              S={S}
              label="Recipient phone *"
              value={address.receiver_phone}
              onChange={(e) => setAddress((p) => ({ ...p, receiver_phone: e.target.value }))}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <Field
              S={S}
              label="Recipient email (optional)"
              value={address.receiver_email}
              onChange={(e) => setAddress((p) => ({ ...p, receiver_email: e.target.value }))}
            />
          </div>

          {!canGoStep3 ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>
              Please fill recipient and delivery address.
            </div>
          ) : null}

          <div style={{ marginTop: 12 }}>
            <Field
              S={S}
              label="Address line 1 *"
              value={address.address_line1}
              onChange={(e) => setAddress((p) => ({ ...p, address_line1: e.target.value }))}
              placeholder="House, street, area"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <Field
              S={S}
              label="Address line 2"
              value={address.address_line2}
              onChange={(e) => setAddress((p) => ({ ...p, address_line2: e.target.value }))}
              placeholder="Landmark, apartment (optional)"
            />
          </div>

          <div style={{ marginTop: 10, ...S.row }}>
            <Field
              S={S}
              label="City *"
              value={address.city}
              onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
            />
            {isKerala(address.state) ? (
              <SelectField
                S={S}
                label="District"
                value={address.district}
                onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
              >
                <option value="">Select district</option>
                {KERALA_DISTRICTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <Field
                S={S}
                label="District"
                value={address.district}
                onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
              />
            )}
          </div>

          <div style={{ marginTop: 10, ...S.row }}>
            <SelectField
              S={S}
              label="State *"
              value={address.state}
              onChange={(e) =>
                setAddress((p) => ({
                  ...p,
                  state: e.target.value,
                  district: isKerala(e.target.value) ? p.district : "",
                }))
              }
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </SelectField>
            <Field
              S={S}
              label="Pincode *"
              value={address.pincode}
              onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))}
            />
          </div>
        </Section>

        {/* Pay */}
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #d9f0e5",
            borderRadius: 12,
            background: "#f8fffb",
            color: "#0f3f32",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Secured payment by PhonePe. Your order total and offers are verified before payment.
        </div>

        <div style={{ marginTop: 14 }}>
          <button style={S.btn("primary", loading)} disabled={loading} onClick={onPayNow} type="button">
            {loading ? "Processing..." : `Pay ₹${money(coupons.grandTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
