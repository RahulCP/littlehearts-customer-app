import React, { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";

import { FONT_FAMILY } from "../../config/themeConstants";
import { buildImageUrl } from "../../utils/imageHelpers";

function money2(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function percent0(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
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
    return `${nm} · ${percent0(offerPercent)}% off`;
  }, [offerName, offerPercent, showOffer]);

  const showStrike = useMemo(() => {
    const s = Number(strikePrice);
    const sell = Number(sellingPrice);
    return Number.isFinite(s) && s > 0 && Number.isFinite(sell) && s > sell;
  }, [strikePrice, sellingPrice]);

  const src = useMemo(() => buildImageUrl(image), [image]);

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Card sx={{ position: "relative", width: "100%", backgroundColor: "#fafafa" }}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            aspectRatio: "2 / 3",
            bgcolor: "#f5f5f5",
          }}
        >
          {imgOk && src ? (
            <CardMedia
              component="img"
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.3s ease-in-out",
                transform: "scale(1.24)",
                cursor: "pointer",
                "&:hover": { transform: "scale(1.28)" },
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
                height: "100%",
                width: "100%",
                backgroundColor: "#f5f5f5",
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

          {showOffer ? (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                maxWidth: "calc(100% - 16px)",
                zIndex: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.72)",
                  borderRadius: 999,
                  px: 0.9,
                  py: 0.35,
                  fontFamily: FONT_FAMILY,
                  fontSize: { xs: "10.5px", md: "11.5px" },
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {offerLine}
              </Typography>
            </Box>
          ) : null}
        </Box>

        {/* Name + prices */}
        <Box sx={{ px: { xs: 1, sm: 1.15 }, pt: { xs: 0.7, sm: 0.85 }, pb: { xs: 0.8, sm: 1 } }}>
          <Typography
            onClick={viewProductDetails}
            sx={{
              color: "black",
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
              fontSize: { xs: 13.5, sm: 14.5, md: 15.5 },
              lineHeight: 1.2,
              display: "block",
              width: "100%",
            }}
            noWrap
          >
            {truncatedTitle}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.65, mt: 0.25, minHeight: 20 }}>
            {showStrike && (
              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  textDecoration: "line-through",
                  color: "#c62828",
                  fontWeight: 400,
                  fontSize: { xs: 10.5, sm: 11 },
                  lineHeight: 1.15,
                }}
              >
                ₹{money2(strikePrice)}
              </Typography>
            )}

            <Typography
              sx={{
                color: "teal",
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
                fontSize: { xs: 14.5, sm: 15.5, md: 16 },
                lineHeight: 1.15,
              }}
            >
              ₹{money2(sellingPrice)}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default SalesCard;
