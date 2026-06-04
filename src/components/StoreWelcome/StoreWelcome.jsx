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
import homeHeroImage1 from "../../assets/images/illolam-home-hero-1.jpg";
import homeHeroImage2 from "../../assets/images/illolam-home-hero-2.jpg";
import homeHeroImage3 from "../../assets/images/illolam-home-hero-3.jpg";

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
  const [activeOffers, setActiveOffers] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

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

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    axios
      .get(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/product-offers/active`)
      .then((res) => {
        if (cancelled) return;
        setActiveOffers(Array.isArray(res.data?.offers) ? res.data.offers : []);
      })
      .catch(() => {
        if (!cancelled) setActiveOffers([]);
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
  const heroImages = useMemo(
    () =>
      [homeHeroImage2, homeHeroImage3, homeHeroImage1].filter(Boolean),
    []
  );

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setHeroIndex((idx) => (idx + 1) % heroImages.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (!heroImages.length) return;
    setHeroIndex((idx) => Math.min(idx, heroImages.length - 1));
  }, [heroImages.length]);

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
        }}
      >
        {heroImages.length ? (
          heroImages.map((image, index) => {
            const active = index === heroIndex;
            return (
              <Box
                key={image}
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.38), rgba(0,0,0,0.16), rgba(0,0,0,0.03)), url("${image}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "brightness(1.08) contrast(1.06) saturate(1.04)",
                  opacity: active ? 1 : 0,
                  transform: active ? "scale(1.045)" : "scale(1)",
                  transition: "opacity 1400ms ease, transform 10500ms ease",
                  willChange: "opacity, transform",
                }}
              />
            );
          })
        ) : (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #111827, #374151)",
            }}
          />
        )}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1180,
            mx: "auto",
            width: "100%",
            px: { xs: 2, sm: 3 },
            pb: { xs: 3, md: 5 },
            color: "#fff",
            textShadow: "0 2px 12px rgba(0,0,0,0.42)",
          }}
        >
          <Stack direction="row" spacing={1.2} sx={{ flexWrap: "wrap" }} useFlexGap>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products`)}
              sx={{
                textTransform: "none",
                borderRadius: 1.25,
                fontWeight: 900,
                fontSize: 14,
                minHeight: 36,
                px: 2,
                py: 0.55,
                bgcolor: "#fff",
                color: "#111827",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
            >
              Shop Now
            </Button>
          </Stack>

          {heroImages.length > 1 ? (
            <Stack direction="row" spacing={0.8} sx={{ mt: 1.6 }}>
              {heroImages.map((image, index) => (
                <Box
                  key={`hero-dot-${image}`}
                  component="button"
                  type="button"
                  aria-label={`Show hero image ${index + 1}`}
                  onClick={() => setHeroIndex(index)}
                  sx={{
                    width: index === heroIndex ? 22 : 8,
                    height: 8,
                    borderRadius: 999,
                    border: 0,
                    p: 0,
                    cursor: "pointer",
                    bgcolor: index === heroIndex ? "#fff" : "rgba(255,255,255,0.45)",
                    transition: "width 220ms ease, background-color 220ms ease",
                  }}
                />
              ))}
            </Stack>
          ) : null}
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

        {activeOffers.length ? (
          <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs: 3, md: 4.5 }, mb: 1.2 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 20, flex: 1 }}>Active offers</Typography>
            </Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.2 }}>
              {activeOffers.map((offer) => (
                <Card
                  key={offer.offer_uid}
                  onClick={() => navigate(`/store/${encodeURIComponent(slug)}/products?offerUid=${encodeURIComponent(offer.offer_uid)}`)}
                  sx={{
                    borderRadius: 1.5,
                    cursor: "pointer",
                    border: "1px solid #ccfbf1",
                    bgcolor: "#f0fdfa",
                    boxShadow: "none",
                  }}
                >
                  <CardContent sx={{ p: 1.4 }}>
                    <Typography sx={{ fontWeight: 950 }} noWrap>{offer.badge_text || offer.name}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                      {Number(offer.product_count || 0)} items
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        ) : null}

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
