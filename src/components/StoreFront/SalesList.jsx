import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Pagination,
  PaginationItem,
  Stack,
} from "@mui/material";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";

import SalesCard from "./SalesCard";
import { API_BASE_URL } from "../../config/constants";
import { FONT_FAMILY } from "../../config/themeConstants";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

function deriveSlugFromPath(pathname) {
  const path = String(pathname || "");

  // supports: /store/:slug/...
  const m1 = path.match(/^\/store\/([^/]+)/i);
  if (m1?.[1]) return decodeURIComponent(m1[1]);

  // supports: /:slug/...
  const m2 = path.match(/^\/([^/]+)/i);
  if (m2?.[1]) return decodeURIComponent(m2[1]);

  return null;
}

const paginationButtonSx = {
  textTransform: "none",
  borderRadius: 1,
  fontWeight: 800,
  color: "#0f766e",
  px: 0.5,
  minWidth: "auto",
  "&:hover": {
    bgcolor: "transparent",
    textDecoration: "underline",
  },
};

const paginationSx = {
  "& .MuiPagination-ul": {
    gap: { xs: 0.2, sm: 0.45 },
    justifyContent: "center",
  },
  "& .MuiPaginationItem-root": {
    borderRadius: 1,
    minWidth: 28,
    height: 28,
    mx: 0,
    fontFamily: FONT_FAMILY,
    fontWeight: 800,
    color: "#334155",
    border: "none",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    bgcolor: "transparent",
    color: "#0f766e",
    textDecoration: "underline",
    "&:hover": { bgcolor: "transparent" },
  },
};

function PaginationBar({
  currentPage,
  pageCount,
  totalItems,
  itemsPerPage,
  onPageChange,
  compact = false,
}) {
  if (totalItems <= 0) return null;

  const hasMultiplePages = totalItems > itemsPerPage;
  if (!hasMultiplePages) return null;

  const goPrevious = () => {
    if (currentPage > 1) onPageChange(null, currentPage - 1);
  };

  const goNext = () => {
    if (currentPage < pageCount) onPageChange(null, currentPage + 1);
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.2}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="flex-end"
      sx={{
        py: { xs: 0.6, sm: 0.8 },
      }}
    >
      <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="flex-end">
        <Button
          variant="text"
          size="small"
          onClick={goPrevious}
          disabled={currentPage <= 1}
          sx={paginationButtonSx}
        >
          <KeyboardArrowLeft fontSize="small" />
        </Button>

        <Pagination
          count={pageCount || 1}
          page={currentPage}
          onChange={onPageChange}
          siblingCount={compact ? 0 : 1}
          boundaryCount={compact ? 1 : 1}
          hidePrevButton
          hideNextButton
          renderItem={(item) => <PaginationItem {...item} />}
          sx={paginationSx}
        />

        <Button
          variant="text"
          size="small"
          onClick={goNext}
          disabled={currentPage >= pageCount}
          sx={paginationButtonSx}
        >
          <KeyboardArrowRight fontSize="small" />
        </Button>
      </Stack>
    </Stack>
  );
}

const SalesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  // ✅ bulletproof slug (fixes mobile routing)
  const effectiveSlug = slug || deriveSlugFromPath(location.pathname) || "illolam";

  // ✅ categoryId comes from query string (?categoryId=1)
  const categoryId = searchParams.get("categoryId"); // string or null

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------------------- load products -------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/store/${effectiveSlug}/storeproducts`,
          {
            params: {
              limit: 200,
              offset: 0,
              // ✅ IMPORTANT: only send when present
              categoryId: categoryId || undefined,
            },
          }
        );

        setAllProducts(Array.isArray(res.data?.products) ? res.data.products : []);
      } catch (e) {
        console.error("Failed to load store products", e);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [effectiveSlug, categoryId]);

  /* -------------------- reset page when category changes -------------------- */
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setCurrentPage(1);
  }, [categoryId]);

  /* -------------------- pagination -------------------- */
  const pageCount = Math.ceil(allProducts.length / itemsPerPage);
  const totalItems = allProducts.length;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allProducts.slice(start, start + itemsPerPage);
  }, [allProducts, currentPage]);

  const handlePageChange = (event, value) => setCurrentPage(value);

  useEffect(() => {
    if (pageCount > 0 && currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  /* -------------------- navigation -------------------- */
  const viewProductDetails = (productUid, itemUid) => {
    const qs = itemUid ? `?itemUid=${encodeURIComponent(itemUid)}` : "";
    navigate(`/store/${effectiveSlug}/product/${encodeURIComponent(productUid)}${qs}`);
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1, sm: 1.5, md: 2 } }}>
      {/* Top pagination */}
      <Box sx={{ mb: { xs: 1.6, md: 2.2 } }}>
        <PaginationBar
          currentPage={currentPage}
          pageCount={pageCount}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          compact
        />
      </Box>

      {/* Product grid */}
      <Grid container spacing={2}>
        {paginatedItems.map((p) => (
          <Grid item xs={6} md={3} key={p.product_uid}>
            <SalesCard
              title={p.label}
              image={p.image}
              sellingPrice={p.selling_price}
              strikePrice={p.strike_price}
              itemLeft={p.available_qty}
              // active is not returned by your listing API anymore — so don't use p.active
              inStock={!!p.in_stock}
              offerName={p?.offer?.name || p?.offer?.badge_text}
              offerPercent={p?.offer?.sale_percent || 0}
              viewProductDetails={() => viewProductDetails(p.product_uid, p.item_uid)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Bottom pagination */}
      <Box sx={{ mt: { xs: 2.4, md: 3.5 } }}>
        <PaginationBar
          currentPage={currentPage}
          pageCount={pageCount}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Box>

      {loading && (
        <Box sx={{ mt: 2, opacity: 0.7, textAlign: "center" }}>Loading…</Box>
      )}
    </Box>
  );
};

export default SalesList;
