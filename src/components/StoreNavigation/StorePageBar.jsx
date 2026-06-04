import React from "react";
import { Box, Breadcrumbs, Button, Link, Stack, Typography, useMediaQuery } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";

const ACCENT_DARK = "#374151";
function ActionButton({ icon, label, onClick, mobile }) {
  const displayLabel = mobile ? String(label || "").replace(/^My\s+/i, "") : label;

  if (mobile) {
    return (
      <Button
        size="small"
        startIcon={icon}
        onClick={onClick}
        sx={{
          minWidth: 0,
          textTransform: "none",
          fontWeight: 900,
          fontSize: 12,
          lineHeight: 1,
          color: ACCENT_DARK,
          bgcolor: "transparent",
          border: 0,
          borderRadius: 0,
          px: 0.25,
          py: 0.9,
          "&:hover": { bgcolor: "transparent", color: "#111827" },
          "& .MuiButton-startIcon": {
            mr: 0.45,
          },
        }}
      >
        {displayLabel}
      </Button>
    );
  }

  return (
    <Button
      size="small"
      startIcon={icon}
      onClick={onClick}
      sx={{
        textTransform: "none",
        fontWeight: 900,
        color: ACCENT_DARK,
        bgcolor: "transparent",
        border: 0,
        borderRadius: 0,
        px: 0.25,
        "&:hover": { bgcolor: "transparent", color: "#111827" },
      }}
    >
      {displayLabel}
    </Button>
  );
}

export default function StorePageBar({ slug, current, crumbs = [], homeLabel = "Home", homeTo = null, sx = {} }) {
  const navigate = useNavigate();
  const mobile = useMediaQuery("(max-width:600px)");
  const storeSlug = encodeURIComponent(slug || "");

  const goHome = () => navigate(homeTo || `/store/${storeSlug}`);
  const goOrders = () => navigate(`/store/${storeSlug}/my-orders`);
  const goCart = () => navigate(`/store/${storeSlug}/my-cart`);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        mb: { xs: 1.25, md: 1.8 },
        mt: { xs: 0, md: 0 },
        minWidth: 0,
        ...sx,
      }}
    >
      <Breadcrumbs
        separator={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />}
        aria-label="Page breadcrumb"
        sx={{
          minWidth: 0,
          flex: 1,
          "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap", minWidth: 0 },
          "& .MuiBreadcrumbs-li": { minWidth: 0 },
        }}
      >
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={goHome}
          sx={{
            border: 0,
            p: 0,
            bgcolor: "transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.35,
            color: ACCENT_DARK,
            fontWeight: 950,
            fontSize: { xs: 12.5, md: 13.5 },
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <HomeRoundedIcon sx={{ fontSize: 16 }} />
          {homeLabel}
        </Link>

        {crumbs.map((crumb) => (
          <Link
            key={`${crumb.label}-${crumb.to || ""}`}
            component="button"
            type="button"
            underline="hover"
            onClick={() => crumb.to && navigate(crumb.to)}
            sx={{
              border: 0,
              p: 0,
              bgcolor: "transparent",
              color: ACCENT_DARK,
              fontWeight: 950,
              fontSize: { xs: 12.5, md: 13.5 },
              cursor: crumb.to ? "pointer" : "default",
              maxWidth: { xs: 108, sm: 220 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {crumb.label}
          </Link>
        ))}

        {current ? (
          <Typography
            sx={{
              color: "#64748b",
              fontWeight: 850,
              fontSize: { xs: 12.5, md: 13.5 },
              maxWidth: { xs: 118, sm: 300 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {current}
          </Typography>
        ) : null}
      </Breadcrumbs>

      <Stack direction="row" spacing={{ xs: 1.15, md: 0.8 }} alignItems="center" sx={{ flex: "0 0 auto" }}>
        <ActionButton
          mobile={mobile}
          label="My Orders"
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: mobile ? 22 : 17 }} />}
          onClick={goOrders}
        />
        <ActionButton
          mobile={mobile}
          label="My Cart"
          icon={<ShoppingBagOutlinedIcon sx={{ fontSize: mobile ? 22 : 17 }} />}
          onClick={goCart}
        />
      </Stack>
    </Box>
  );
}
