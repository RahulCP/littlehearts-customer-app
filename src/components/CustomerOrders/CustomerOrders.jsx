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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { API_BASE_URL } from "../../config/constants";
import { ensureStoreCustomerSession } from "../../auth/customerSession";

function money(value) {
  const n = Number(value || 0);
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function cleanStatus(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function saleItems(order) {
  return (Array.isArray(order.items) ? order.items : []).filter(
    (item) => String(item.line_type || "SALE").toUpperCase() !== "RETURN"
  );
}

function itemSummary(order) {
  const items = saleItems(order);
  if (!items.length) return "Order items";
  const names = items
    .map((item) => item.product_label || item.product_name || item.name || item.sku)
    .filter(Boolean);
  if (!names.length) return `${items.length} item${items.length === 1 ? "" : "s"}`;
  const visible = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${visible} +${names.length - 2} more` : visible;
}

function deliveryAddress(order) {
  const addr = order.addresses?.shipping || order.shipping_address || order.addresses?.billing || null;
  if (!addr) return { name: order.buyer_name || "Delivery address", lines: [] };
  const lines = [
    [addr.address_line1, addr.address_line2].filter(Boolean).join(", "),
    [addr.city, addr.district, addr.state, addr.pincode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);
  return {
    name: addr.name || order.buyer_name || "Delivery address",
    phone: addr.phone || "",
    lines,
  };
}

function latestShipment(order) {
  return order.shipment || (Array.isArray(order.shipments) ? order.shipments[0] : null);
}

function orderMessage(order, shipment) {
  const ship = String(shipment?.status || "").toUpperCase();
  const pay = String(order.payment_status || order.status || "").toUpperCase();
  if (ship === "DELIVERED") return "Delivered. We hope you love it.";
  if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(ship)) {
    return "Your order has been shipped and is on the way.";
  }
  if (["PICKUP_READY", "PACKED"].includes(ship)) {
    return "Your order is packed and ready for courier pickup.";
  }
  if (["FAILED", "CANCELLED", "CANCELED"].includes(pay)) {
    return "This order could not be completed. Please contact us if money was deducted.";
  }
  if (["CREATED", "PAYMENT_PENDING", "PENDING"].includes(pay)) {
    return "Payment is pending. Once payment is complete, we will start processing it.";
  }
  return "We are packing your order and will ship it soon.";
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
      <Box sx={{ mb: 2.2 }}>
        <Typography sx={{ fontWeight: 950, fontSize: { xs: 25, md: 34 }, letterSpacing: 0 }}>
          My Orders
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, md: 14 }, mt: 0.3 }}>
          Track your placed orders, delivery address, and courier updates.
        </Typography>
      </Box>

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
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>Sign in to view your orders</Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.7, maxWidth: 430, mx: "auto" }}>
              Use the sign-in button in the top menu. We will show orders linked to the same checkout email.
            </Typography>
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
            const items = saleItems(order);
            const addr = deliveryAddress(order);
            const shipment = latestShipment(order);
            const shipStatus = shipment?.status || order.shipping_status || order.fulfillment_status;
            const trackingUrl = shipment?.tracking_url;
            const trackingNumber = shipment?.tracking_number;
            return (
              <Card
                key={order.id || order.order_id || orderNumber(order)}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 950, fontSize: { xs: 17, md: 19 } }}>
                        {itemSummary(order)}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.2 }}>
                        {formatDate(order.created_at || order.order_date)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                      <Chip label={pay.text} color={pay.color} size="small" sx={{ fontWeight: 800 }} />
                      {shipStatus ? (
                        <Chip
                          icon={<LocalShippingIcon />}
                          label={cleanStatus(shipStatus)}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      ) : null}
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      mt: 1.4,
                      p: 1.2,
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Stack direction="row" spacing={0.9} alignItems="flex-start">
                      <LocationOnIcon sx={{ fontSize: 19, color: "#475569", mt: 0.15 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                          {addr.name}
                          {addr.phone ? `, ${addr.phone}` : ""}
                        </Typography>
                        {addr.lines.length ? (
                          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.2 }}>
                            {addr.lines.join(" • ")}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.2 }}>
                            Delivery address not available.
                          </Typography>
                        )}
                        <Typography sx={{ color: "#64748b", fontSize: 12.5, mt: 0.6, fontWeight: 800 }}>
                          {orderNumber(order)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ mt: 1.3 }}>
                    <Typography sx={{ fontWeight: 900, color: "#334155" }}>
                      {orderMessage(order, shipment)}
                    </Typography>
                    {trackingNumber ? (
                      <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.35 }}>
                        Tracking number: <Box component="span" sx={{ fontWeight: 900, color: "#111827" }}>{trackingNumber}</Box>
                      </Typography>
                    ) : null}
                  </Box>

                  {items.length ? (
                    <Box sx={{ mt: 1.2 }}>
                      {items.slice(0, 3).map((item) => (
                        <Stack
                          key={item.id || `${item.product_label}-${item.quantity}`}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ py: 0.55 }}
                        >
                          <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13.5, color: "#475569" }} noWrap>
                            {item.product_label || item.product_name || "Item"}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 800 }}>
                            x{Number(item.quantity || 0)}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  ) : null}

                  <Divider sx={{ my: 1.3 }} />
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Order total</Typography>
                      <Typography sx={{ fontWeight: 950, fontSize: 20 }}>
                        {money(order.grand_total || order.total_amount || order.net_total)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} justifyContent={{ xs: "space-between", sm: "flex-end" }}>
                      {trackingUrl ? (
                        <Button
                          variant="contained"
                          size="small"
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon />}
                          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2 }}
                        >
                          Track order
                        </Button>
                      ) : null}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/store/${encodeURIComponent(slug)}/confirmation?orderId=${encodeURIComponent(order.id)}`)}
                        sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                      >
                        Details
                      </Button>
                    </Stack>
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
