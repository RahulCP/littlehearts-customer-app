// src/components/checkout/Confirmation.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../../config/constants";

/**
 * Confirmation page (self-contained)
 * - Reads :slug from route: /store/:slug/confirmation
 * - Reads transactionId from query: ?transactionId=...
 * - Polls DB status endpoint for up to MAX_POLL_MS
 * - Falls back to PhonePe order status check via backend
 *
 * IMPORTANT:
 * 1) Ensure backend has DB status endpoint:
 *    GET /store/:slug/orders/status/:transactionId
 *    returns { salesStatus: "SC" } or { status: "SC" } etc.
 *
 * 2) Ensure backend has PhonePe status endpoint:
 *    GET /store/:slug/phonepe/status?merchantOrderId=...
 *    uses Authorization: O-Bearer <token> (optional)
 */

const MAX_POLL_MS = 60_000; // 60 seconds
const POLL_INTERVAL_MS = 4_000; // 4 seconds

const styles = {
  page: {
    minHeight: "100vh",
    padding: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#f6f7fb",
  },
  wrap: {
    width: "100%",
    maxWidth: 760,
    marginTop: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    padding: 18,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    textAlign: "center",
  },
  muted: {
    marginTop: 8,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 1.5,
  },
  pill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f0f2f7",
    fontSize: 13,
    marginTop: 10,
  },
  row: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
  },
  btnPrimary: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSecondary: {
    border: "1px solid #d0d5dd",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  toast: {
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: 14,
  },
  loaderWrap: {
    marginTop: 16,
    display: "flex",
    justifyContent: "center",
  },
  loader: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    border: "4px solid rgba(0,0,0,0.15)",
    borderTopColor: "rgba(0,0,0,0.7)",
    animation: "spin 1s linear infinite",
  },
};

export default function Confirmation() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const qp = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const transactionId = qp.get("transactionId") || "";

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // "SUCCESS" | "FAILED" | null

  const startedAtRef = useRef(Date.now());
  const timerRef = useRef(null);

  function stopTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function normalizeDbStatus(s) {
    const v = String(s || "").trim().toUpperCase();
    // your webhook code uses SC/SF
    if (v === "SC" || v === "SUCCESS" || v === "COMPLETED") return "SUCCESS";
    if (v === "SF" || v === "FAILED" || v === "FAILURE") return "FAILED";
    return null;
  }

  async function fetchDbStatus() {
    const url = `${API_BASE_URL}/store/${encodeURIComponent(slug)}/orders/status/${encodeURIComponent(
      transactionId
    )}`;
    const { data } = await axios.get(url);
    return normalizeDbStatus(data?.salesStatus || data?.status || data?.sales_status);
  }

  async function checkPhonePeFinalStatus() {
    const accessToken = localStorage.getItem("phonepe_auth_token");
    const headers = {};
    if (accessToken) headers.Authorization = `O-Bearer ${accessToken}`;

    const url = `${API_BASE_URL}/store/${encodeURIComponent(
      slug
    )}/phonepe/status?merchantOrderId=${encodeURIComponent(transactionId)}`;

    const { data } = await axios.get(url, { headers });

    const state =
      data?.state ||
      data?.data?.state ||
      data?.data?.data?.state ||
      data?.data?.orderState ||
      data?.orderState;

    const v = String(state || "").trim().toUpperCase();
    if (v === "COMPLETED" || v === "SUCCESS") return "SUCCESS";
    if (v === "FAILED" || v === "FAILURE") return "FAILED";
    return null;
  }

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      setChecking(false);
      setPaymentStatus("FAILED");
      setToast("Missing transactionId in URL.");
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;

      const elapsed = Date.now() - startedAtRef.current;

      // time limit -> fallback to PhonePe API check
      if (elapsed >= MAX_POLL_MS) {
        try {
          setChecking(false);
          const finalSt = await checkPhonePeFinalStatus();
          if (cancelled) return;

          if (finalSt) setPaymentStatus(finalSt);
          else {
            setPaymentStatus("FAILED");
            setToast("Could not confirm payment. If amount is debited, contact support.");
          }
        } catch (e) {
          console.error("[confirmation] phonepe status error", e?.response?.data || e.message);
          if (!cancelled) {
            setPaymentStatus("FAILED");
            setToast(
              e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Could not verify payment status."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
            stopTimer();
          }
        }
        return;
      }

      // DB polling
      try {
        const st = await fetchDbStatus();
        if (cancelled) return;

        if (st === "SUCCESS" || st === "FAILED") {
          setPaymentStatus(st);
          setLoading(false);
          setChecking(false);
          stopTimer();
          return;
        }
      } catch (e) {
        // keep polling
      }

      timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, transactionId]);

  const title = useMemo(() => {
    if (loading) return "We are checking your payment…";
    if (paymentStatus === "SUCCESS") return "Order Confirmed!";
    return "Payment Failed";
  }, [loading, paymentStatus]);

  const titleColor = useMemo(() => {
    if (loading) return "#111827";
    if (paymentStatus === "SUCCESS") return "#16a34a";
    return "#dc2626";
  }, [loading, paymentStatus]);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {toast ? <div style={styles.toast}>{toast}</div> : null}

        <div style={styles.card}>
          <h1 style={{ ...styles.title, color: titleColor }}>{title}</h1>

          {transactionId ? (
            <div style={{ textAlign: "center" }}>
              <span style={styles.pill}>
                Transaction: <b>{transactionId}</b>
              </span>
            </div>
          ) : null}

          {loading ? (
            <>
              <p style={styles.muted}>
                Please don’t refresh or press back. This may take a few moments.
                {checking ? " We’ll update you shortly." : " We’re doing a final verification."}
              </p>

              <div style={styles.loaderWrap}>
                <div style={styles.loader} />
              </div>

              <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
            </>
          ) : paymentStatus === "SUCCESS" ? (
            <>
              <p style={{ ...styles.muted, fontSize: 15 }}>
                🎉 Your order has been placed successfully. We’ll start processing it shortly.
              </p>

              <div style={styles.row}>
                <button
                  type="button"
                  style={styles.btnPrimary}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}`)}
                >
                  Continue Shopping
                </button>

                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}/orders`)}
                >
                  View Orders
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ ...styles.muted, fontSize: 15 }}>
                Your payment could not be confirmed.
              </p>
              <p style={styles.muted}>
                If your amount was debited, it may take a few minutes to update. You can retry now
                or contact support with the transaction id.
              </p>

              <div style={styles.row}>
                <button
                  type="button"
                  style={styles.btnPrimary}
                  onClick={() => window.location.reload()}
                >
                  Retry Status Check
                </button>

                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}/cart`)}
                >
                  Back to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}