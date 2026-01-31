import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  InputAdornment,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { IMAGE_BASE_URL } from "../../config/constants";

/* join base + path safely */
function joinUrl(base, path) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  if (!b || !p) return null;
  return `${b}/${p}`;
}

const SearchWithDropdown = ({ onSelectItem, itemsList = [], setClearSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  // Allow parent (SearchDrawer) to clear the search when closing
  useEffect(() => {
    if (setClearSearch) {
      setClearSearch(() => () => setSearchTerm(""));
    }
  }, [setClearSearch]);

  const options = useMemo(() => {
    const q = String(searchTerm || "").trim().toLowerCase();
    if (!q) return [];
    return (itemsList || []).filter((item) =>
      String(item?.label || "").toLowerCase().includes(q)
    );
  }, [itemsList, searchTerm]);

  // ✅ supports both:
  // - new storefront list: option.image = "stores/.../file"
  // - old inventory: option.image might be "something.jpg" (still works)
  const getImageUrl = (option) => {
    const raw =
      option?.image ||
      option?.cover_image_url ||
      (Array.isArray(option?.product_images) ? option.product_images[0] : null);

    if (!raw) return null;

    // If someone already stored full URL, don't touch
    if (/^https?:\/\//i.test(String(raw))) return String(raw);

    return joinUrl(IMAGE_BASE_URL, raw);
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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: isMobile ? "100%" : "500px",
        minWidth: isMobile ? "90%" : "350px",
      }}
    >
      <Autocomplete
        freeSolo
        fullWidth
        options={options}
        openOnFocus={false}
        filterOptions={(x) => x}
        getOptionLabel={(option) => option?.label || ""}
        renderOption={(props, option) => {
          const imgUrl = getImageUrl(option);
          const price = getPrice(option);

          return (
            <Box
              component="li"
              {...props}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "10px",
                borderBottom: "1px solid #eee",
                "&:hover": { backgroundColor: "#f7f7f7" },
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#f0f0f0",
                  flex: "0 0 auto",
                  border: "1px solid #eee",
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
                ) : null}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} fontSize="14px" noWrap>
                  {option?.label || "No Label"}
                </Typography>

                {price != null && price !== "" && (
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    ₹{Number(price).toFixed(0)}
                  </Typography>
                )}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: "25px",
              boxShadow: "0px 4px 12px rgba(0, 128, 128, 0.2)",
              fontSize: "16px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "16px",
                borderRadius: "25px",
                "& fieldset": { borderColor: "#008080" },
                "&:hover fieldset": { borderColor: "#007070" },
                "&.Mui-focused fieldset": { borderColor: "#005050" },
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
