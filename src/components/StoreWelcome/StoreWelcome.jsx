import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { API_BASE_URL } from "../../config/constants";
import { buildImageUrl } from "../../utils/imageHelpers";

function useCustomerSession(slug) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((v) => v + 1);
    window.addEventListener("customer-auth-changed", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("customer-auth-changed", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  return useMemo(() => {
    void tick;
    if (!slug) return { token: null, customer: null };
    const token = localStorage.getItem(`store_customer_token_${slug}`);
    let customer = null;
    try {
      customer = JSON.parse(localStorage.getItem(`store_customer_${slug}`) || "null");
    } catch {
      customer = null;
    }
    return { token, customer };
  }, [slug, tick]);
}

function productImage(product) {
  return (
    product?.image ||
    product?.cover_image_url ||
    (Array.isArray(product?.images) ? product.images[0] : "") ||
    (Array.isArray(product?.images_flat) ? product.images_flat[0] : "")
  );
}

function money2(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function StoreWelcome() {
  const { slug: routeSlug, storeSlug } = useParams();
  const slug = routeSlug || storeSlug;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/products`)
      .then((res) => {
        if (cancelled) return;
        setStore(res.data?.store || { slug, name: slug });
        setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
        setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
      })
      .catch(() => {
        if (cancelled) return;
        setStore({ slug, name: slug });
        setCategories([]);
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const categoryCards = categories.map((cat) => {
    const count = products.filter((p) => {
      const productCat = p.category_id ?? p.category?.id ?? p.categoryId;
      return String(productCat) === String(cat.id);
    }).length;
    const sample = products.find((p) => {
      const productCat = p.category_id ?? p.category?.id ?? p.categoryId;
      return String(productCat) === String(cat.id);
    });
    return { ...cat, count, image: productImage(sample) };
  });

  const featured = products.slice(0, 5);
  const productTiles = products.slice(0, 8);
  const storeName = store?.name || slug || "Illolam";
  const heroImage = buildImageUrl(productImage(featured[0]));

  return (
    <Box
      sx={{
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        bgcolor: "#fff",
        pb: 6,
      }}
    >
      <Box
        sx={{
          minHeight: { xs: "50vh", md: "52vh" },
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          bgcolor: "#111827",
          backgroundImage: heroImage
            ? `linear-gradient(90deg, rgba(0,0,0,0.68), rgba(0,0,0,0.28), rgba(0,0,0,0.08)), url("${heroImage}")`
            : "linear-gradient(135deg, #111827, #374151)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            maxWidth: 1180,
            mx: "auto",
            width: "100%",
            px: { xs: 2, sm: 3 },
            pb: { xs: 3, md: 5 },
            color: "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 950, fontSize: { xs: 38, sm: 48, md: 68 }, lineHeight: 0.95 }}>
            {storeName}
          </Typography>
          <Typography sx={{ mt: 1.3, maxWidth: 560, color: "rgba(255,255,255,0.86)", fontSize: { xs: 15, md: 18 } }}>
            Fresh collections, easy checkout, and order history in one store page.
          </Typography>

          <Stack direction="row" spacing={1.2} sx={{ mt: 2.4, flexWrap: "wrap" }} useFlexGap>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products`)}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
                fontWeight: 950,
                bgcolor: "#fff",
                color: "#111827",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
            >
              Shop all items
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 1.2, sm: 2 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs: 2.4, md: 4 }, mb: 1.2 }}>
          <LocalMallIcon fontSize="small" />
          <Typography sx={{ fontWeight: 950, fontSize: 20, flex: 1 }}>Shop by category</Typography>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.2 }}>
          {loading ? (
            <Card sx={{ gridColumn: "1 / -1", borderRadius: 2 }}><CardContent><CircularProgress size={20} /></CardContent></Card>
          ) : categoryCards.length ? (
            categoryCards.map((cat) => {
              const img = buildImageUrl(cat.image);
              return (
                <Card
                  key={cat.id}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products?categoryId=${encodeURIComponent(cat.id)}`)}
                  sx={{ borderRadius: 1.5, cursor: "pointer", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}
                >
                  <Box sx={{ aspectRatio: "4 / 3", bgcolor: "#f8fafc" }}>
                    {img ? (
                      <Box component="img" src={img} alt={cat.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "#94a3b8" }}>
                        <Inventory2Icon />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1.2 }}>
                    <Typography sx={{ fontWeight: 900 }} noWrap>{cat.name}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{cat.count} items</Typography>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ gridColumn: "1 / -1", borderRadius: 2 }}><CardContent>No categories yet.</CardContent></Card>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs: 3, md: 4.5 }, mb: 1.2 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 20, flex: 1 }}>Latest items</Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products`)}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            View all
          </Button>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.2 }}>
          {productTiles.length ? (
            productTiles.map((p, idx) => {
              const img = buildImageUrl(productImage(p));
              const price = Number(p.selling_price || p.price || p.sale_price || 0);
              return (
                <Card
                  key={p.product_uid || idx}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}/product/${encodeURIComponent(p.product_uid)}`)}
                  sx={{ borderRadius: 1.5, cursor: "pointer", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}
                >
                  <Box sx={{ aspectRatio: "1 / 1.12", bgcolor: "#f8fafc" }}>
                    {img ? (
                      <Box component="img" src={img} alt={p.label || p.name || "Item"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "#94a3b8" }}>
                        <Inventory2Icon />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1.2 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: 14 }} noWrap>
                      {p.label || p.name || "Item"}
                    </Typography>
                    {price > 0 ? (
                      <Typography sx={{ fontWeight: 950, fontSize: 14 }}>₹{money2(price)}</Typography>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ gridColumn: "1 / -1", borderRadius: 2 }}>
              <CardContent>{loading ? <CircularProgress size={20} /> : "No items yet."}</CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
