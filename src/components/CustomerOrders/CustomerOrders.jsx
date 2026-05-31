import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { API_BASE_URL } from "../../config/constants";
import CustomerAuthButtons from "../../auth/CustomerAuthButtons";
import { ensureStoreCustomerSession } from "../../auth/customerSession";

function money(value) {
  const n = Number(value || 0);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentLabel(order) {
  const status = String(order.payment_status || order.status || "").toLowerCase();
  if (["paid", "success", "passed"].includes(status)) return { text: "Paid", color: "success" };
  if (["failed", "cancelled", "canceled"].includes(status)) return { text: "Failed", color: "error" };
  return { text: "Payment pending", color: "warning" };
}

function orderNumber(order) {
  return order.order_code || order.order_no || order.public_order_no || `Order #${order.id}`;
}

export default function CustomerOrders() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [authTick, setAuthTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionSyncing, setSessionSyncing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const bump = () => setAuthTick((v) => v + 1);
    window.addEventListener("customer-auth-changed", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("customer-auth-changed", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const token = useMemo(() => {
    void authTick;
    if (!slug) return null;
    return localStorage.getItem(`store_customer_token_${slug}`);
  }, [slug, authTick]);

  useEffect(() => {
    if (!slug || token) return;

    let cancelled = false;
    setSessionSyncing(true);
    ensureStoreCustomerSession(slug)
      .then((session) => {
        if (!cancelled && session?.token) setAuthTick((v) => v + 1);
      })
      .catch((err) => {
        console.warn("Could not sync customer session:", err?.message || err);
      })
      .finally(() => {
        if (!cancelled) setSessionSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, token, authTick]);

  useEffect(() => {
    if (!slug || !token) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/my/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data?.rows) ? res.data.rows : [];
        setOrders(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          localStorage.removeItem(`store_customer_token_${slug}`);
          localStorage.removeItem(`store_customer_${slug}`);
          setAuthTick((v) => v + 1);
          return;
        }
        setError(err?.response?.data?.message || "Could not load your orders.");
        setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 1.2, sm: 2 }, py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/store/${encodeURIComponent(slug)}`)}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Store
        </Button>
        <Typography sx={{ fontWeight: 950, fontSize: { xs: 24, md: 34 }, flex: 1 }}>
          My Orders
        </Typography>
        <CustomerAuthButtons storeSlug={slug} />
      </Stack>

      {sessionSyncing ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 7 }}>
          <CircularProgress size={28} />
          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
            Checking your sign-in session…
          </Typography>
        </Box>
      ) : !token ? (
        <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <ReceiptLongIcon sx={{ fontSize: 44, color: "#64748b", mb: 1 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>Login to view your orders</Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.7, mb: 2 }}>
              Your order history is linked to the email used during checkout.
            </Typography>
            <CustomerAuthButtons storeSlug={slug} />
          </CardContent>
        </Card>
      ) : loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 7 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : orders.length === 0 ? (
        <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <ShoppingBagIcon sx={{ fontSize: 44, color: "#64748b", mb: 1 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>No orders yet</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, textTransform: "none", fontWeight: 900, borderRadius: 2 }}
              onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products`)}
            >
              Start shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.4}>
          {orders.map((order) => {
            const pay = paymentLabel(order);
            const shipStatus = order.shipping_status || order.fulfillment_status || order.order_status;
            return (
              <Card
                key={order.id || order.order_id || orderNumber(order)}
                sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}
              >
                <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 950, fontSize: 17 }} noWrap>
                        {orderNumber(order)}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {formatDate(order.created_at || order.order_date)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                      <Chip label={pay.text} color={pay.color} size="small" sx={{ fontWeight: 800 }} />
                      {shipStatus ? (
                        <Chip
                          icon={<LocalShippingIcon />}
                          label={String(shipStatus).replace(/_/g, " ")}
                          size="small"
                          sx={{ fontWeight: 800, textTransform: "capitalize" }}
                        />
                      ) : null}
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 1.3 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Total</Typography>
                      <Typography sx={{ fontWeight: 950, fontSize: 20 }}>
                        {money(order.grand_total || order.total_amount || order.net_total)}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/store/${encodeURIComponent(slug)}/confirmation?orderId=${encodeURIComponent(order.id)}`)}
                      sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                    >
                      Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
