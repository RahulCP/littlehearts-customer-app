// src/components/storefront/ProductDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  Paper,
} from "@mui/material";

import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import ProductImageSlider from "./ProductImageSlider";
import { STYLE_MAP } from "../../config/styleOptions";
import { API_BASE_URL } from "../../config/constants";

/* ✅ PAGE FONT (change here once) */
const PAGE_FONT = `"Assistant", sans-serif`;

/* ---------------- CART HELPERS ---------------- */
function getCartStorageKey(slug) {
  return `cart_${slug || "default"}`;
}
function readCart(slug) {
  try {
    const key = getCartStorageKey(slug);
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("readCart error:", e);
    return [];
  }
}
function writeCart(slug, cartItems) {
  try {
    const key = getCartStorageKey(slug);
    localStorage.setItem(key, JSON.stringify(cartItems || []));
  } catch (e) {
    console.error("writeCart error:", e);
  }
}
function addToCart(slug, cartLine) {
  const cart = readCart(slug);

  const idx = cart.findIndex(
    (x) =>
      x?.item_uid === cartLine?.item_uid &&
      x?.store_slug === cartLine?.store_slug
  );

  if (idx >= 0) {
    const nextQty =
      (Number(cart[idx].quantity) || 1) + (Number(cartLine.quantity) || 1);
    cart[idx] = {
      ...cart[idx],
      quantity: nextQty,
      updated_at: new Date().toISOString(),
    };
  } else {
    cart.push({
      ...cartLine,
      quantity: Number(cartLine.quantity) || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  writeCart(slug, cart);
  return cart;
}

/* ---------------- helpers ---------------- */
function money0(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}
function asBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes";
}

const ProductDetails = () => {
  const navigate = useNavigate();
  const { slug, productUid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Selection-first: subcategory, then style
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState(null);

  // UI feedback
  const [toast, setToast] = useState("");
  const [adding, setAdding] = useState(false);

  /* -------------------- load product (NEW API) -------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/store/${slug}/storeproduct/${productUid}`
        );

        const p = res.data?.product || null;
        setProduct(p);

        const variants = Array.isArray(p?.variants) ? p.variants : [];

        if (variants.length > 0) {
          const urlItemUid = searchParams.get("itemUid");

          const initial =
            (urlItemUid &&
              variants.find((v) => String(v?.item_uid) === String(urlItemUid))) ||
            variants.find((v) => asBool(v?.is_main)) ||
            variants[0];

          setSelectedSubcategoryId(
            initial?.subcategory_id != null ? String(initial.subcategory_id) : null
          );
          setSelectedStyleId(
            initial?.style_id != null ? String(initial.style_id) : null
          );

          if (!urlItemUid && initial?.item_uid) {
            const next = new URLSearchParams(searchParams);
            next.set("itemUid", initial.item_uid);
            setSearchParams(next, { replace: true });
          }
        } else {
          setSelectedSubcategoryId(null);
          setSelectedStyleId(null);
        }
      } catch (e) {
        console.error("Failed to load product details", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug && productUid) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, productUid]);

  /* -------------------- derived data (ALL hooks BEFORE returns) -------------------- */
  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants]
  );

  // subcategory list (id + name)
  const subcats = useMemo(() => {
    const map = new Map(); // id -> name
    variants.forEach((v) => {
      if (v?.subcategory_id == null) return;
      const id = String(v.subcategory_id);
      const nm = String(v?.subcategory_name || "").trim();
      if (!map.has(id)) map.set(id, nm || `Option ${id}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [variants]);

  // style list
  const styles = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => {
      if (v?.style_id != null) set.add(String(v.style_id));
    });
    return Array.from(set);
  }, [variants]);

  // Compatibility: subcat -> allowed styles
  const subcatToStyles = useMemo(() => {
    const out = new Map(); // subcatId -> Set(styleId)
    variants.forEach((v) => {
      const scid = v?.subcategory_id != null ? String(v.subcategory_id) : null;
      const sid = v?.style_id != null ? String(v.style_id) : null;
      if (!scid || !sid) return;
      if (!out.has(scid)) out.set(scid, new Set());
      out.get(scid).add(sid);
    });
    return out;
  }, [variants]);

  // ✅ show only compatible styles for selected subcategory
  const compatibleStyles = useMemo(() => {
    if (!selectedSubcategoryId) return styles;
    const allow = subcatToStyles.get(String(selectedSubcategoryId));
    if (!allow || allow.size === 0) return [];
    return styles.filter((sid) => allow.has(String(sid)));
  }, [styles, selectedSubcategoryId, subcatToStyles]);

  // Preferred item from selection (subcategory first, then style)
  const preferredItem = useMemo(() => {
    if (!variants.length) return null;

    const scid =
      selectedSubcategoryId != null ? String(selectedSubcategoryId) : null;
    const sid = selectedStyleId != null ? String(selectedStyleId) : null;

    let list = variants.slice();
    if (scid) list = list.filter((v) => String(v?.subcategory_id) === scid);
    if (sid) list = list.filter((v) => String(v?.style_id) === sid);

    return (
      list.find((v) => asBool(v?.is_main)) ||
      list[0] ||
      variants.find((v) => asBool(v?.is_main)) ||
      variants[0] ||
      null
    );
  }, [variants, selectedSubcategoryId, selectedStyleId]);

  // Keep URL itemUid in sync
  useEffect(() => {
    if (!preferredItem?.item_uid) return;
    const current = searchParams.get("itemUid");
    if (String(current || "") === String(preferredItem.item_uid)) return;

    const next = new URLSearchParams(searchParams);
    next.set("itemUid", preferredItem.item_uid);
    setSearchParams(next, { replace: true });
  }, [preferredItem?.item_uid, searchParams, setSearchParams]);

  // toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const leftQty = Number(preferredItem?.available_qty || 0);

  const canAdd = useMemo(() => {
    return !!preferredItem?.item_uid && asBool(preferredItem?.active) && leftQty > 0;
  }, [preferredItem, leftQty]);

  // ✅ Always show full gallery, but put selected variant image first
  const imagesToShow = useMemo(() => {
    const gallery = Array.isArray(product?.images) ? product.images : [];
    const hero = preferredItem?.image ? String(preferredItem.image) : null;

    const seen = new Set();
    const out = [];

    if (hero) {
      const s = hero.trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }

    for (const g of gallery) {
      const s = String(g || "").trim();
      if (!s) continue;
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }

    if (!out.length && hero) return [hero];

    return out;
  }, [product?.images, preferredItem?.image]);

  const offerText = useMemo(() => {
    const pct = Number(product?.offer?.sale_percent || 0);
    if (!Number.isFinite(pct) || pct <= 0) return "";
    const name = String(
      product?.offer?.name || product?.offer?.badge_text || "Offer"
    );
    return `${name} · ${money0(pct)}%`;
  }, [product?.offer]);

  const stockText = useMemo(() => {
    if (!canAdd || leftQty <= 0) return "Sold out";
    return `${leftQty} in stock`;
  }, [canAdd, leftQty]);

  const showStrike =
    Number(preferredItem?.strike_price || 0) >
    Number(preferredItem?.selling_price || 0);

  const sellingPrice = Number(preferredItem?.selling_price || 0);
  const strikePrice = Number(preferredItem?.strike_price || 0);

  /* -------------------- safe early return -------------------- */
  if (loading) {
    return (
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, fontFamily: PAGE_FONT }}>
        <CircularProgress size={20} />
        <Typography sx={{ fontFamily: PAGE_FONT }}>Loading…</Typography>
      </Box>
    );
  }
  if (!product) {
    return (
      <Box sx={{ p: 2, fontFamily: PAGE_FONT }}>
        <Typography sx={{ fontWeight: 800, fontFamily: PAGE_FONT }}>
          Product not found.
        </Typography>
      </Box>
    );
  }

  /* -------------------- handlers -------------------- */
  const effectiveSlug = slug;

  const handleSelectSubcat = (id) => {
    const scid = String(id);
    setSelectedSubcategoryId(scid);

    const allow = subcatToStyles.get(scid);
    if (!allow || allow.size === 0) {
      setSelectedStyleId(null);
      return;
    }

    if (selectedStyleId && allow.has(String(selectedStyleId))) return;

    setSelectedStyleId(Array.from(allow)[0]);
  };

  const handleSelectStyle = (id) => {
    setSelectedStyleId(String(id));
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);

      if (!preferredItem?.item_uid) {
        setToast("Choose selection first.");
        return;
      }
      if (!canAdd) {
        setToast("Out of stock.");
        return;
      }

      const styleLabel = preferredItem?.style_id
        ? STYLE_MAP[String(preferredItem.style_id)] || null
        : null;

      const subcatLabel =
        preferredItem?.subcategory_name ||
        (preferredItem?.subcategory_id ? `Option ${preferredItem.subcategory_id}` : null);

      const cartLine = {
        store_slug: effectiveSlug,
        product_uid: productUid,
        item_uid: preferredItem.item_uid,
        product_label: product.label,

        subcategory_id: preferredItem.subcategory_id ?? null,
        subcategory_label: subcatLabel,

        style_id: preferredItem.style_id ?? null,
        style_label: styleLabel,

        selling_price: Number(preferredItem.selling_price || 0),
        strike_price:
          preferredItem.strike_price != null ? Number(preferredItem.strike_price) : null,

        image:
          preferredItem?.image ||
          (Array.isArray(product?.images) && product.images[0]) ||
          null,

        quantity: 1,
      };

      addToCart(effectiveSlug, cartLine);
      setToast("Added to cart ✅");
    } catch (e) {
      console.error(e);
      setToast("Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!preferredItem?.item_uid) {
        setToast("Choose selection first.");
        return;
      }
      if (!canAdd) {
        setToast("Out of stock.");
        return;
      }

      const styleLabel = preferredItem?.style_id
        ? STYLE_MAP[String(preferredItem.style_id)] || null
        : null;

      const subcatLabel =
        preferredItem?.subcategory_name ||
        (preferredItem?.subcategory_id ? `Option ${preferredItem.subcategory_id}` : null);

      const buyNowLine = {
        store_slug: effectiveSlug,
        product_uid: productUid,
        item_uid: preferredItem.item_uid,
        product_label: product.label,

        subcategory_id: preferredItem.subcategory_id ?? null,
        subcategory_label: subcatLabel,

        style_id: preferredItem.style_id ?? null,
        style_label: styleLabel,

        selling_price: Number(preferredItem.selling_price || 0),
        strike_price:
          preferredItem.strike_price != null ? Number(preferredItem.strike_price) : null,

        image:
          preferredItem?.image ||
          (Array.isArray(product?.images) && product.images[0]) ||
          null,

        quantity: 1,
      };

      navigate(`/${effectiveSlug}/checkout`, {
        state: { buyNowItems: [buyNowLine], buyNow: true },
      });
    } catch (e) {
      console.error(e);
      setToast("Failed to proceed to checkout.");
    }
  };

  /* -------------------- render -------------------- */
  return (
    <Box
      sx={{
        p: { xs: 1.1, md: 3 },                // ✅ tighter on mobile
        maxWidth: 1100,
        mx: "auto",
        fontFamily: PAGE_FONT,
        "& *": { fontFamily: PAGE_FONT },
      }}
    >
      {/* Toast */}
      {toast && (
        <Box
          sx={{
            position: "fixed",
            right: 16,
            bottom: 16,
            bgcolor: "#111",
            color: "#fff",
            px: 2,
            py: 1.25,
            borderRadius: 2,
            fontSize: 13,
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            zIndex: 9999,
            maxWidth: 320,
            fontFamily: PAGE_FONT,
          }}
        >
          {toast}
        </Box>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1.0, md: 3 }}           // ✅ reduce spacing on mobile
        alignItems="flex-start"
      >
        {/* LEFT: Image (desktop) | Header + Image + Price (mobile) */}
        <Box sx={{ width: { xs: "100%", md: 520 }, maxWidth: "100%" }}>
          {/* ✅ MOBILE: header above image (tight) */}
          {isMobile && (
            <Box sx={{ mb: 0.6 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 21, lineHeight: 1.12 }}>
                {product.label}
              </Typography>
            </Box>
          )}

          {/* Image */}
          <ProductImageSlider
            images={imagesToShow}
            alt={product.label}
            height={isMobile ? 410 : 560}
          />

          {/* ✅ MOBILE: price below image (green price, red strike, offer right aligned) */}
          {isMobile && (
            <Box sx={{ mt: 0.8 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                {/* Price (GREEN) */}
                <Typography sx={{ fontWeight: 950, fontSize: 22, color: "#1B8A3A" }}>
                  ₹{money0(sellingPrice)}
                </Typography>

                {/* Strike (RED) */}
                {showStrike && (
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 14,
                      color: "#D32F2F",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{money0(strikePrice)}
                  </Typography>
                )}

                {/* Offer (float right) */}
                <Box sx={{ ml: "auto" }}>
                  {offerText ? (
                    <Chip
                      label={offerText}
                      size="small"
                      sx={{
                        fontWeight: 950,
                        bgcolor: "#111",
                        color: "#fff",
                        borderRadius: 999,
                        height: 24,
                        "& .MuiChip-label": { px: 1.1, fontSize: 12.2 },
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* RIGHT: Details (desktop) | Rest (mobile) */}
        <Box sx={{ flex: 1, minWidth: { md: 360 }, width: "100%" }}>
          {/* ✅ DESKTOP: name + price on right side */}
          {!isMobile && (
            <>
              <Typography sx={{ fontWeight: 950, fontSize: 26, lineHeight: 1.15 }}>
                {product.label}
              </Typography>

              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                <Typography sx={{ fontWeight: 950, fontSize: 26 }}>
                  ₹{money0(sellingPrice)}
                </Typography>

                {showStrike && (
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "rgba(0,0,0,0.55)",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{money0(strikePrice)}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                {offerText ? (
                  <Chip
                    label={offerText}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      bgcolor: "#111",
                      color: "#fff",
                      borderRadius: 999,
                    }}
                  />
                ) : null}
              </Stack>
            </>
          )}

          {/* ✅ tighter gap on mobile */}
          <Box sx={{ height: { xs: 8, md: 14 } }} />

          {/* ✅ Subcategories (label = Size) with reduced spacing */}
          {subcats.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 950,
                  fontSize: 12.2,
                  opacity: 0.75,
                  mb: 0.6,
                }}
              >
                Size
              </Typography>

              <Stack
                direction="row"
                spacing={0.6}                  // ✅ tighter
                flexWrap="wrap"
                useFlexGap
                sx={{ rowGap: 0.6 }}
              >
                {subcats.map((sc) => {
                  const selected = String(selectedSubcategoryId || "") === String(sc.id);
                  return (
                    <Chip
                      key={sc.id}
                      label={sc.name}
                      clickable
                      onClick={() => handleSelectSubcat(sc.id)}
                      variant={selected ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 950,
                        borderRadius: 999,
                        borderColor: selected ? "#111" : "rgba(0,0,0,0.18)",
                        bgcolor: selected ? "#111" : "transparent",
                        color: selected ? "#fff" : "#111",
                        height: 30,
                        "& .MuiChip-label": { px: 1.1 },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* ✅ Style options (tight) */}
          {compatibleStyles.length > 0 && (
            <Box sx={{ mt: 1.2 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 12.2, opacity: 0.75, mb: 0.6 }}>
                Color
              </Typography>

              <Stack
                direction="row"
                spacing={0.6}                  // ✅ tighter
                flexWrap="wrap"
                useFlexGap
                sx={{ rowGap: 0.6 }}
              >
                {compatibleStyles.map((sid) => {
                  const label = STYLE_MAP[String(sid)] || `Style ${sid}`;
                  const selected = String(selectedStyleId || "") === String(sid);
                  return (
                    <Chip
                      key={sid}
                      label={label}
                      clickable
                      onClick={() => handleSelectStyle(sid)}
                      variant={selected ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 950,
                        borderRadius: 999,
                        borderColor: selected ? "#111" : "rgba(0,0,0,0.18)",
                        bgcolor: selected ? "#111" : "transparent",
                        color: selected ? "#fff" : "#111",
                        height: 30,
                        "& .MuiChip-label": { px: 1.1 },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* ✅ In-stock ABOVE buttons (tight) */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.0 }} alignItems="center">
            <Chip
              label={stockText}
              size="small"
              sx={{
                fontWeight: 950,
                bgcolor: "#f5f5f5",
                borderRadius: 999,
                height: 24,
                "& .MuiChip-label": { px: 1.1, fontSize: 12.2 },
              }}
            />
          </Stack>

          {/* Buttons row: Buy Now first + Add to Cart beside */}
          <Stack direction="row" spacing={1.0} sx={{ mt: 1.0 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={!canAdd}
              onClick={handleBuyNow}
              sx={{
                bgcolor: "#111",
                color: "#fff",
                fontWeight: 950,
                textTransform: "none",
                px: 2.2,
                py: 1.05,
                borderRadius: 2,
                "&:hover": { bgcolor: "#000" },
              }}
            >
              Buy Now
            </Button>

            <Button
              fullWidth
              variant="outlined"
              disabled={!canAdd || adding}
              onClick={handleAddToCart}
              sx={{
                borderColor: "#111",
                color: "#111",
                fontWeight: 950,
                textTransform: "none",
                px: 2.0,
                py: 1.05,
                borderRadius: 2,
                "&:hover": { borderColor: "#000" },
              }}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </Button>
          </Stack>

          {/* Payment secured banner */}
          <Paper
            variant="outlined"
            sx={{
              mt: 1.0,                         // ✅ tighter
              p: 1.0,
              borderRadius: 2,
              bgcolor: "rgba(0,128,128,0.06)",
              borderColor: "rgba(0,128,128,0.18)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <VerifiedOutlinedIcon sx={{ color: "teal" }} />
              <Typography sx={{ fontWeight: 950, fontSize: 13 }}>
                Payment is secured by PhonePe
              </Typography>
            </Stack>
          </Paper>

          {/* Description */}
          {product.description ? (
            <>
              <Divider sx={{ my: 1.6 }} />
              <Typography
                sx={{
                  color: "rgba(0,0,0,0.78)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.62,
                }}
              >
                {product.description}
              </Typography>
            </>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

export default ProductDetails;
