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
import { STYLE_MAP, getStyleMeta } from "../../config/styleOptions";
import { API_BASE_URL } from "../../config/constants";
import StorePageBar from "../StoreNavigation/StorePageBar";
import { availabilityMessage, checkRequestedQuantity } from "../../utils/cartAvailability";

/* ✅ PAGE FONT (change here once) */
const PAGE_FONT = `"Assistant", sans-serif`;
const ACCENT = "#0f766e";
const ACCENT_DARK = "#115e59";
const ACCENT_SOFT = "#ecfdf5";
const ACCENT_BORDER = "#99f6e4";

function ColorDot({ hex, size = 18, selected = false }) {
  if (!hex) return null;
  const normalized = String(hex).trim().toLowerCase();
  const isLight =
    normalized === "#fff" ||
    normalized === "#ffffff" ||
    normalized === "white" ||
    normalized === "#f8fafc" ||
    normalized === "#f9fafb";
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: hex.startsWith("linear-gradient") ? undefined : hex,
        background: hex.startsWith("linear-gradient") ? hex : undefined,
        border: selected || isLight ? "1px solid rgba(15,23,42,0.55)" : "1px solid rgba(0,0,0,0.28)",
        boxShadow: isLight
          ? "inset 0 0 0 2px rgba(255,255,255,0.8), 0 1px 4px rgba(15,23,42,0.18)"
          : "inset 0 0 0 1px rgba(255,255,255,0.45), 0 1px 4px rgba(15,23,42,0.12)",
        display: "inline-block",
        flex: "0 0 auto",
      }}
    />
  );
}

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
  const maxQty = Number(cartLine?.stocked_quantity ?? cartLine?.available_qty ?? 0);
  const hasMaxQty = Number.isFinite(maxQty) && maxQty > 0;
  const incomingQty = Number(cartLine.quantity) || 1;
  let capped = false;

  const idx = cart.findIndex(
    (x) =>
      x?.item_uid === cartLine?.item_uid &&
      x?.store_slug === cartLine?.store_slug
  );

  if (idx >= 0) {
    const requestedQty = (Number(cart[idx].quantity) || 1) + incomingQty;
    const nextQty = hasMaxQty ? Math.min(requestedQty, maxQty) : requestedQty;
    capped = hasMaxQty && requestedQty > maxQty;

    cart[idx] = {
      ...cart[idx],
      ...cartLine,
      quantity: nextQty,
      updated_at: new Date().toISOString(),
    };
  } else {
    const nextQty = hasMaxQty ? Math.min(incomingQty, maxQty) : incomingQty;
    capped = hasMaxQty && incomingQty > maxQty;

    cart.push({
      ...cartLine,
      quantity: nextQty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  writeCart(slug, cart);
  return { cart, capped };
}

/* ---------------- helpers ---------------- */
function money2(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}
function percent0(v) {
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

  const selectedImage = imagesToShow[0] || preferredItem?.image || null;

  const offerText = useMemo(() => {
    const pct = Number(product?.offer?.sale_percent || 0);
    if (!Number.isFinite(pct) || pct <= 0) return "";
    const name = String(
      product?.offer?.name || product?.offer?.badge_text || "Offer"
    );
    return `${name} · ${percent0(pct)}% off`;
  }, [product?.offer]);

  const stockMeta = useMemo(() => {
    if (!canAdd || leftQty <= 0) {
      return {
        label: "Sold out",
        bg: "#FDECEC",
        color: "#B42318",
        border: "rgba(180,35,24,0.22)",
      };
    }

    if (leftQty <= 3) {
      return {
        label: `Only ${leftQty} left`,
        bg: "#FFF4E5",
        color: "#B54708",
        border: "rgba(181,71,8,0.24)",
      };
    }

    return {
      label: `In stock · ${leftQty} available`,
      bg: "#EAF7EF",
      color: "#177245",
      border: "rgba(23,114,69,0.2)",
    };
  }, [canAdd, leftQty]);

  const showStrike =
    Number(preferredItem?.strike_price || 0) >
    Number(preferredItem?.selling_price || 0);

  const sellingPrice = Number(preferredItem?.selling_price || 0);
  const strikePrice = Number(preferredItem?.strike_price || 0);
  const categoryId = product?.category?.id;
  const categoryName = product?.category?.name || "Category";

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

      const existingQty = readCart(effectiveSlug)
        .filter((line) => line?.item_uid === preferredItem.item_uid)
        .reduce((sum, line) => sum + (Number(line?.quantity || 1) || 1), 0);
      const availability = await checkRequestedQuantity(effectiveSlug, preferredItem, existingQty + 1);
      if (!availability.ok) {
        setToast(availabilityMessage(availability) || "This item is not available now.");
        return;
      }

      const styleLabel = preferredItem?.style_id
        ? STYLE_MAP[String(preferredItem.style_id)] || null
        : null;
      const styleHex = preferredItem?.style_id
        ? getStyleMeta(preferredItem.style_id)?.hex || null
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
        style_hex: styleHex,

        selling_price: Number(preferredItem.selling_price || 0),
        strike_price:
          preferredItem.strike_price != null ? Number(preferredItem.strike_price) : null,

        image: selectedImage,
        stocked_quantity: leftQty,
        available_qty: leftQty,
        in_stock: canAdd,

        quantity: 1,
      };

      const result = addToCart(effectiveSlug, cartLine);
      setToast(result?.capped ? `Only ${leftQty} available.` : "Added to cart.");
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

      const availability = await checkRequestedQuantity(effectiveSlug, preferredItem, 1);
      if (!availability.ok) {
        setToast(availabilityMessage(availability) || "This item is not available now.");
        return;
      }

      const styleLabel = preferredItem?.style_id
        ? STYLE_MAP[String(preferredItem.style_id)] || null
        : null;
      const styleHex = preferredItem?.style_id
        ? getStyleMeta(preferredItem.style_id)?.hex || null
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
        style_hex: styleHex,

        selling_price: Number(preferredItem.selling_price || 0),
        strike_price:
          preferredItem.strike_price != null ? Number(preferredItem.strike_price) : null,

        image: selectedImage,
        stocked_quantity: leftQty,
        available_qty: leftQty,
        in_stock: canAdd,

        quantity: 1,
      };
      navigate(`/store/${effectiveSlug}/checkout`, {
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
        px: { xs: 1.5, md: 3 },
        pt: { xs: 0.7, md: 2 },
        pb: { xs: 1.5, md: 3 },
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
            bgcolor: ACCENT_DARK,
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

      <StorePageBar
        slug={effectiveSlug}
        current=""
        crumbs={
          categoryId
            ? [
                {
                  label: categoryName,
                  to: `/store/${encodeURIComponent(effectiveSlug)}/products?categoryId=${encodeURIComponent(categoryId)}`,
                },
              ]
            : []
        }
        sx={{ mb: { xs: 1.15, md: 1.8 } }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1.6, md: 3 }}
        alignItems="flex-start"
      >
        {/* LEFT: Image (desktop) | Header + Image + Price (mobile) */}
        <Box sx={{ width: { xs: "100%", md: 520 }, maxWidth: "100%" }}>
          {/* ✅ MOBILE: header above image (tight) */}
          {isMobile && (
            <Box sx={{ mb: 1.85 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 22, lineHeight: 1.16 }}>
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
            <Box sx={{ mt: 1.25 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                {/* Price (GREEN) */}
                <Typography sx={{ fontWeight: 950, fontSize: 22, color: "#1B8A3A" }}>
                  ₹{money2(sellingPrice)}
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
                    ₹{money2(strikePrice)}
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
                        bgcolor: ACCENT_DARK,
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
                  ₹{money2(sellingPrice)}
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
                    ₹{money2(strikePrice)}
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
                      bgcolor: ACCENT_DARK,
                      color: "#fff",
                      borderRadius: 999,
                    }}
                  />
                ) : null}
              </Stack>
            </>
          )}

          <Box sx={{ height: { xs: 14, md: 14 } }} />

          {(subcats.length > 0 || compatibleStyles.length > 0) && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: 1,
                alignItems: "start",
              }}
            >
              <Box>
                {subcats.length > 0 ? (
                  <>
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

                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.6 }}>
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
                              borderColor: selected ? ACCENT : "rgba(15,23,42,0.18)",
                              bgcolor: selected ? ACCENT : "transparent",
                              color: selected ? "#fff" : "#111",
                              height: 30,
                              "& .MuiChip-label": { px: 1.1 },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </>
                ) : null}
              </Box>

              <Box sx={{ textAlign: "right" }}>
                {compatibleStyles.length > 0 ? (
                  <>
                    <Typography sx={{ fontWeight: 950, fontSize: 12.2, opacity: 0.75, mb: 0.6 }}>
                      Color
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.7}
                      flexWrap="wrap"
                      useFlexGap
                      justifyContent="flex-end"
                      sx={{ rowGap: 0.7 }}
                    >
                      {compatibleStyles.map((sid) => {
                        const meta = getStyleMeta(sid);
                        const label = meta?.label || STYLE_MAP[String(sid)] || `Style ${sid}`;
                        const selected = String(selectedStyleId || "") === String(sid);
                        return (
                          <Box
                            key={sid}
                            component="button"
                            type="button"
                            title={label}
                            aria-label={`Select color ${label}`}
                            onClick={() => handleSelectStyle(sid)}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              border: selected ? `2px solid ${ACCENT}` : "1px solid rgba(15,23,42,0.2)",
                              bgcolor: selected ? ACCENT_SOFT : "#fff",
                              display: "inline-grid",
                              placeItems: "center",
                              p: 0,
                              cursor: "pointer",
                              boxShadow: selected
                                ? "0 0 0 3px rgba(15,118,110,0.14)"
                                : "0 1px 4px rgba(15,23,42,0.08)",
                              "&:hover": { borderColor: ACCENT },
                            }}
                          >
                            <ColorDot hex={meta?.hex} size={23} selected={selected} />
                          </Box>
                        );
                      })}
                    </Stack>
                  </>
                ) : null}
              </Box>
            </Box>
          )}

          {/* ✅ In-stock ABOVE buttons (tight) */}
          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.5, md: 1.0 } }} alignItems="center">
            <Chip
              label={stockMeta.label}
              size="small"
              sx={{
                fontWeight: 950,
                bgcolor: stockMeta.bg,
                color: stockMeta.color,
                border: `1px solid ${stockMeta.border}`,
                borderRadius: 999,
                height: 24,
                "& .MuiChip-label": { px: 1.1, fontSize: 12.2 },
              }}
            />
          </Stack>

          {/* Buttons row: Buy Now first + Add to Cart beside */}
          <Stack direction="row" spacing={1.0} sx={{ mt: { xs: 1.35, md: 1.0 } }}>
            <Button
              fullWidth
              variant="contained"
              disabled={!canAdd}
              onClick={handleBuyNow}
              sx={{
                bgcolor: ACCENT,
                color: "#fff",
                fontWeight: 950,
                textTransform: "none",
                px: 2.2,
                py: 1.05,
                borderRadius: 2,
                "&:hover": { bgcolor: ACCENT_DARK },
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
                borderColor: ACCENT_BORDER,
                color: ACCENT_DARK,
                bgcolor: "#fff",
                fontWeight: 950,
                textTransform: "none",
                px: 2.0,
                py: 1.05,
                borderRadius: 2,
                "&:hover": { borderColor: ACCENT, bgcolor: ACCENT_SOFT },
              }}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </Button>
          </Stack>

          {/* Payment secured banner */}
          <Paper
            variant="outlined"
            sx={{
              mt: { xs: 1.45, md: 1.0 },
              p: { xs: 1.15, md: 1.0 },
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
              <Divider sx={{ my: { xs: 2.1, md: 1.6 } }} />
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
