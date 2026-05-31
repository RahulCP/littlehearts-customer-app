import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  InputAdornment,
  Typography,
  useMediaQuery,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { buildImageUrl } from "../../utils/imageHelpers";

const money0 = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";
};

const SearchWithDropdown = ({
  onSelectItem,
  itemsList = [],
  setClearSearch,
  mobileDrawer = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isRichMobile = isMobile || mobileDrawer;

  // Allow parent (SearchDrawer) to clear the search when closing
  useEffect(() => {
    if (setClearSearch) {
      setClearSearch(() => () => setSearchTerm(""));
    }
  }, [setClearSearch]);

  const options = useMemo(() => {
    const q = String(searchTerm || "").trim().toLowerCase();
    const list = Array.isArray(itemsList) ? itemsList : [];
    if (!q) return isRichMobile ? list.slice(0, 10) : [];
    return list
      .filter((item) => {
        const haystack = [
          item?.label,
          item?.name,
          item?.category?.name,
          item?.category_name,
          item?.subcategory_name,
          item?.subcategory_label,
          item?.offer?.name,
          item?.offer?.badge_text,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 24);
  }, [itemsList, searchTerm, isRichMobile]);

  // ✅ supports both:
  // - new storefront list: option.image = "stores/.../file"
  // - old inventory: option.image might be "something.jpg" (still works)
  const getImageUrl = (option) => {
    const raw =
      option?.image ||
      option?.cover_image_url ||
      (Array.isArray(option?.product_images) ? option.product_images[0] : null);

    return raw ? buildImageUrl(raw) : null;
  };

  const getPrice = (option) => {
    // old list
    if (option?.sellingprice != null) return option.sellingprice;

    // new storeproducts list
    if (option?.selling_price != null) return option.selling_price;

    // fallback
    if (option?.min_price != null) return option.min_price;

    return null;
  };

  const getStrikePrice = (option) => {
    if (option?.strike_price != null) return option.strike_price;
    if (option?.strikePrice != null) return option.strikePrice;
    return null;
  };

  const getCategory = (option) =>
    option?.category?.name ||
    option?.category_name ||
    option?.categoryLabel ||
    option?.subcategory_name ||
    option?.subcategory_label ||
    "";

  const getStockLabel = (option) => {
    const inStock = option?.in_stock;
    const qty = Number(option?.available_qty ?? option?.stocked_quantity ?? option?.quantity_left ?? 0);
    if (inStock === false || qty <= 0) return { text: "Sold out", color: "error" };
    if (qty <= 3) return { text: `Only ${qty} left`, color: "warning" };
    return { text: `${qty} available`, color: "success" };
  };

  const getOfferLabel = (option) => {
    const pct = Number(option?.offer?.sale_percent || option?.offerPercent || 0);
    if (!Number.isFinite(pct) || pct <= 0) return "";
    return `${option?.offer?.badge_text || option?.offer?.name || "Offer"} ${money0(pct)}%`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: isRichMobile ? "100%" : "500px",
        minWidth: isRichMobile ? "100%" : "350px",
      }}
    >
      <Autocomplete
        freeSolo
        fullWidth
        disablePortal={isRichMobile}
        sx={{
          width: "100%",
          ...(isRichMobile
            ? {
                "& .MuiAutocomplete-popperDisablePortal": {
                  position: "static !important",
                  transform: "none !important",
                  width: "100% !important",
                  mt: 0.8,
                },
              }
            : {}),
        }}
        options={options}
        openOnFocus={isRichMobile}
        filterOptions={(x) => x}
        getOptionLabel={(option) => option?.label || ""}
        noOptionsText={searchTerm ? "No matching items" : "Start typing to search"}
        ListboxProps={{
          sx: {
            maxHeight: isRichMobile ? "64vh" : 360,
            p: isRichMobile ? 0.7 : 0.5,
          },
        }}
        PaperComponent={({ children }) => (
          <Box
            sx={{
              mt: 0.8,
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: isRichMobile ? 2.5 : 2,
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.16)",
              overflow: "hidden",
            }}
          >
            {children}
          </Box>
        )}
        renderOption={(props, option) => {
          const imgUrl = getImageUrl(option);
          const price = getPrice(option);
          const strike = getStrikePrice(option);
          const showStrike = Number(strike || 0) > Number(price || 0);
          const category = getCategory(option);
          const stock = getStockLabel(option);
          const offerLabel = getOfferLabel(option);

          return (
            <Box
              component="li"
              {...props}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: isRichMobile ? 1 : 1.1,
                mb: 0.6,
                borderRadius: 2,
                border: "1px solid transparent",
                "&:hover": { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" },
                '&[aria-selected="true"]': {
                  backgroundColor: "#ecfeff",
                  borderColor: "#99f6e4",
                },
              }}
            >
              <Box
                sx={{
                  width: isRichMobile ? 82 : 70,
                  height: isRichMobile ? 94 : 70,
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "#f8fafc",
                  flex: "0 0 auto",
                  border: "1px solid #e5e7eb",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={option?.label || "Product"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      // prevent broken icon loop
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Inventory2OutlinedIcon sx={{ color: "#94a3b8" }} />
                )}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontWeight={900} fontSize={isRichMobile ? "15px" : "14px"} noWrap>
                  {option?.label || "No Label"}
                </Typography>

                {category ? (
                  <Typography sx={{ color: "#64748b", fontSize: 12.5, mt: 0.25 }} noWrap>
                    {category}
                  </Typography>
                ) : null}

                {price != null && price !== "" && (
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.7, mt: 0.6 }}>
                    {showStrike ? (
                      <Typography sx={{ color: "#94a3b8", textDecoration: "line-through", fontSize: 12 }}>
                        ₹{money0(strike)}
                      </Typography>
                    ) : null}
                    <Typography sx={{ color: "#0f766e", fontWeight: 950, fontSize: 15 }}>
                      ₹{money0(price)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 0.8 }}>
                  <Chip
                    label={stock.text}
                    color={stock.color}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: 11, fontWeight: 800 }}
                  />
                  {offerLabel ? (
                    <Chip
                      icon={<LocalOfferOutlinedIcon />}
                      label={offerLabel}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 800,
                        bgcolor: "#111827",
                        color: "#fff",
                        "& .MuiChip-icon": { color: "#fff", fontSize: 15 },
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            placeholder="Search items"
            variant="outlined"
            fullWidth
            value={searchTerm}
            autoFocus={mobileDrawer}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: isRichMobile ? 2.5 : "25px",
              boxShadow: isRichMobile ? "none" : "0px 4px 12px rgba(0, 128, 128, 0.2)",
              fontSize: "16px",
              "& .MuiOutlinedInput-root": {
                height: isRichMobile ? "48px" : "40px",
                fontSize: "16px",
                borderRadius: isRichMobile ? 2.5 : "25px",
                bgcolor: "#fff",
                "& fieldset": { borderColor: isRichMobile ? "#cbd5e1" : "#008080" },
                "&:hover fieldset": { borderColor: isRichMobile ? "#94a3b8" : "#007070" },
                "&.Mui-focused fieldset": { borderColor: "#0f766e", borderWidth: 1.5 },
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#008080" }} />
                </InputAdornment>
              ),
            }}
          />
        )}
        onChange={(e, value) => value && onSelectItem(value)}
      />
    </Box>
  );
};

export default SearchWithDropdown;
