// src/pages/store/checkout/components/steps/AddressStep.jsx
import React from "react";
import { INDIAN_STATES, KERALA_DISTRICTS, isKerala } from "../../constants/addressOptions";
import { normalizeEmailInput, normalizePhoneInput } from "./contactFormat";

function AddressSelect({ S, value, onChange, children, error = "" }) {
  return (
    <select style={{ ...S.input, ...(error ? S.inputError : null), background: "#fff" }} value={value} onChange={onChange}>
      {children}
    </select>
  );
}

export default function AddressStep({
  S,
  buyer,
  address,
  setAddress,
  canGoStep3,
  errors = {},
  onBack,
  onNext,
}) {
  return (
    <>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Mailing details</h2>
      <p style={{ ...S.muted, marginTop: 6 }}>
        Recipient details are filled from contact details. You can change them.
      </p>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Recipient Name *</div>
          <input
            style={{ ...S.input, ...(errors.receiver_name ? S.inputError : null) }}
            value={address.receiver_name}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_name: e.target.value }))}
            placeholder="Recipient name"
          />
        </div>
      </div>

      <div style={{ marginTop: 12, ...S.twoCol }}>
        <div style={S.field}>
          <div style={S.label}>Recipient Phone *</div>
          <input
            style={{ ...S.input, ...(errors.receiver_phone ? S.inputError : null) }}
            value={address.receiver_phone}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_phone: normalizePhoneInput(e.target.value) }))}
            placeholder="Recipient phone"
            inputMode="tel"
            maxLength={10}
          />
        </div>
        <div style={S.field}>
          <div style={S.label}>Recipient Email *</div>
          <input
            type="email"
            style={{ ...S.input, ...(errors.receiver_email ? S.inputError : null) }}
            value={address.receiver_email}
            onChange={(e) => setAddress((p) => ({ ...p, receiver_email: normalizeEmailInput(e.target.value) }))}
            placeholder="Recipient email"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Address line 1 *</div>
          <input
            style={{ ...S.input, ...(errors.address_line1 ? S.inputError : null) }}
            value={address.address_line1}
            onChange={(e) => setAddress((p) => ({ ...p, address_line1: e.target.value }))}
            placeholder="House, street, area"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={S.field}>
          <div style={S.label}>Address line 2</div>
          <input
            style={S.input}
            value={address.address_line2}
            onChange={(e) => setAddress((p) => ({ ...p, address_line2: e.target.value }))}
            placeholder="Landmark, apartment (optional)"
          />
        </div>
      </div>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>City *</div>
          <input style={{ ...S.input, ...(errors.city ? S.inputError : null) }} value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />
        </div>
        <div style={S.field}>
          <div style={S.label}>District *</div>
          {isKerala(address.state) ? (
            <AddressSelect S={S} value={address.district} error={errors.district} onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}>
              <option value="">Select district</option>
              {KERALA_DISTRICTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </AddressSelect>
          ) : (
            <input style={{ ...S.input, ...(errors.district ? S.inputError : null) }} value={address.district} onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))} />
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, ...S.row }}>
        <div style={S.field}>
          <div style={S.label}>State *</div>
          <AddressSelect
            S={S}
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
          </AddressSelect>
        </div>
        <div style={S.field}>
          <div style={S.label}>Pincode *</div>
          <input style={{ ...S.input, ...(errors.pincode ? S.inputError : null) }} value={address.pincode} onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, maxWidth: 520 }}>
        <button style={{ ...S.btn("secondary"), width: 160 }} onClick={onBack} type="button">
          Back
        </button>
        <button style={S.btn("primary", false)} onClick={onNext} type="button">
          Continue
        </button>
      </div>
    </>
  );
}
