import React, { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";

import { FONT_FAMILY } from "../../config/themeConstants";
import { buildImageUrl } from "../../utils/imageHelpers";

function money0(v) {
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
    return `${nm} · ${money0(offerPercent)}%`;
  }, [offerName, offerPercent, showOffer]);

  const showStrike = useMemo(() => {
    const s = Number(strikePrice);
    const sell = Number(sellingPrice);
    return Number.isFinite(s) && s > 0 && Number.isFinite(sell) && s > sell;
  }, [strikePrice, sellingPrice]);

  const stockMeta = useMemo(() => {
    const left = Number(itemLeft || 0);
    if (!inStock || left <= 0) {
      return { text: "Sold out", bg: "rgba(180,35,24,0.92)", color: "#fff" };
    }
    if (left <= 3) {
      return { text: `Only ${left} left`, bg: "rgba(181,71,8,0.94)", color: "#fff" };
    }
    return { text: `${left} available`, bg: "rgba(255,255,255,0.92)", color: "#111" };
  }, [itemLeft, inStock]);

  const src = useMemo(() => buildImageUrl(image), [image]);

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
                objectFit: "cover",
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
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              maxWidth: "calc(100% - 16px)",
            }}
          >
            {showOffer && (
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.78)",
                  borderRadius: 999,
                  px: 1,
                  py: 0.45,
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
                color: stockMeta.color,
                bgcolor: stockMeta.bg,
                borderRadius: 999,
                px: 1,
                py: 0.45,
                fontFamily: FONT_FAMILY,
                fontSize: { xs: "12px", md: "13px" },
                fontWeight: 700,
              }}
            >
              {stockMeta.text}
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
