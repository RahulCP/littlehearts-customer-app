// src/components/storefront/ProductImageSlider.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { buildImageUrl } from "../../utils/imageHelpers";

/**
 * Shopify-style image gallery:
 * - big image
 * - thumbnails (only if >1)
 * - arrows on mobile
 */
const ProductImageSlider = ({ images = [], alt, height = 560 }) => {
  const isMobile = useMediaQuery("(max-width:900px)");

  const list = useMemo(() => {
    const raw = Array.isArray(images) ? images : [];
    const cleaned = raw.map((x) => String(x || "").trim()).filter(Boolean);

    // unique, preserve order
    const seen = new Set();
    const uniq = [];
    for (const x of cleaned) {
      if (seen.has(x)) continue;
      seen.add(x);
      uniq.push(x);
    }
    return uniq;
  }, [images]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.length]);

  const hasImages = list.length > 0;

  const current = hasImages ? buildImageUrl(list[index]) : "";

  const goPrev = () => setIndex((p) => (p === 0 ? list.length - 1 : p - 1));
  const goNext = () => setIndex((p) => (p + 1) % list.length);

  if (!hasImages) {
    return (
      <Box
        sx={{
          height,
          width: "100%",
          bgcolor: "#f1f1f1",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        No Image
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Big image */}
      <Box
        sx={{
          position: "relative",
          height,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#f6f6f6",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box
          component="img"
          src={current}
          alt={alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Mobile arrows */}
        {isMobile && list.length > 1 && (
          <>
            <IconButton
              onClick={goPrev}
              sx={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.85)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              onClick={goNext}
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.85)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails (only when multiple images) */}
      {list.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.25,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.15)",
              borderRadius: 10,
            },
          }}
        >
          {list.map((img, i) => {
            const src = buildImageUrl(img);
            const active = i === index;

            return (
              <Box
                key={`${img}-${i}`}
                onClick={() => setIndex(i)}
                sx={{
                  width: 74,
                  height: 74,
                  flex: "0 0 auto",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: active
                    ? "2px solid #111"
                    : "1px solid rgba(0,0,0,0.12)",
                  opacity: active ? 1 : 0.9,
                  bgcolor: "#f6f6f6",
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={alt}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default ProductImageSlider;
