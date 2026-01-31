import React, { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";

import { API_BASE_URL, IMAGE_BASE_URL } from "../../config/constants";
import { FONT_FAMILY } from "../../config/themeConstants";

function money0(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}

function safeJoin(base, path) {
  const b = String(base || "");
  const p = String(path || "");
  if (!b) return p;
  if (!p) return b;
  const bb = b.endsWith("/") ? b.slice(0, -1) : b;
  const pp = p.startsWith("/") ? p.slice(1) : p;
  return `${bb}/${pp}`;
}

function getImageBase() {
  if (IMAGE_BASE_URL && String(IMAGE_BASE_URL).trim()) return IMAGE_BASE_URL;
  const api = String(API_BASE_URL || "").trim();
  if (!api) return "";
  return api.replace(/\/api\/?$/i, "");
}

function buildImageSrc(image) {
  const img = String(image || "").trim();
  if (!img) return "";
  if (/^https?:\/\//i.test(img)) return img;
  return safeJoin(getImageBase(), img);
}

const SalesCard = ({
  image,
  title,
  viewProductDetails,
  offerName,
  offerPercent,
  sellingPrice,
  strikePrice,
  itemLeft,
  inStock,
}) => {
  const [imgOk, setImgOk] = useState(true);
  const isMobile = useMediaQuery("(max-width:600px)");

  const truncationLength = isMobile ? 17 : 30;
  const truncatedTitle =
    title && title.length > truncationLength
      ? `${title.substring(0, truncationLength)}...`
      : title || "Product";

  const showOffer = useMemo(() => {
    const p = Number(offerPercent || 0);
    return Number.isFinite(p) && p > 0;
  }, [offerPercent]);

  const offerLine = useMemo(() => {
    if (!showOffer) return "";
    const nm = String(offerName || "Offer").trim();
    return `${nm} · ${money0(offerPercent)}%`;
  }, [offerName, offerPercent, showOffer]);

  const showStrike = useMemo(() => {
    const s = Number(strikePrice);
    const sell = Number(sellingPrice);
    return Number.isFinite(s) && s > 0 && Number.isFinite(sell) && s > sell;
  }, [strikePrice, sellingPrice]);

  const stockText = useMemo(() => {
    const left = Number(itemLeft || 0);
    if (!inStock || left <= 0) return "Sold out";
    return `${left} in stock`;
  }, [itemLeft, inStock]);

  const src = useMemo(() => buildImageSrc(image), [image]);

  return (
    <Box sx={{ maxWidth: 350 }}>
      <Card sx={{ position: "relative", backgroundColor: "#fafafa" }}>
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          {imgOk && src ? (
            <CardMedia
              component="img"
              sx={{
                height: { xs: 250, sm: 450 },
                width: "100%",
                transition: "transform 0.3s ease-in-out",
                cursor: "pointer",
                "&:hover": { transform: "scale(1.05)" },
              }}
              image={src}
              title={title}
              onClick={viewProductDetails}
              onError={() => setImgOk(false)}
            />
          ) : (
            <Box
              onClick={viewProductDetails}
              sx={{
                height: { xs: 250, sm: 450 },
                width: "100%",
                backgroundColor: "#f3f3f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Typography sx={{ fontFamily: FONT_FAMILY, opacity: 0.7 }}>
                No Image
              </Typography>
            </Box>
          )}

          {/* Bottom-left overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: "black",
              color: "white",
              borderRadius: "12px",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {showOffer && (
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  fontFamily: FONT_FAMILY,
                  fontSize: { xs: "12px", md: "13px" },
                  fontWeight: 600,
                }}
              >
                {offerLine}
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontFamily: FONT_FAMILY,
                fontSize: { xs: "12px", md: "13px" },
                fontWeight: 500,
              }}
            >
              {stockText}
            </Typography>
          </Box>
        </Box>

        {/* Name + prices */}
        <Box sx={{ margin: "10px 0px 10px 10px" }}>
          <Typography
            variant="caption"
            onClick={viewProductDetails}
            sx={{
              color: "black",
              fontFamily: FONT_FAMILY,
              fontWeight: "400",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
              fontSize: { xs: "15px", md: "18px" },
              display: "inline-block",
              maxWidth: "95%",
            }}
          >
            {truncatedTitle}
          </Typography>

          <br />

          {showStrike && (
            <Typography
              variant="caption"
              sx={{
                fontFamily: FONT_FAMILY,
                textDecoration: "line-through",
                color: "#c62828",
                fontWeight: "300",
                fontSize: { xs: "12px", md: "12px" },
                marginRight: "6px",
              }}
            >
              ₹{money0(strikePrice)}
            </Typography>
          )}

          <Typography
            variant="caption"
            sx={{
              color: "teal",
              fontFamily: FONT_FAMILY,
              fontWeight: "600",
              fontSize: { xs: "17px", md: "17px" },
            }}
          >
            ₹{money0(sellingPrice)}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default SalesCard;
