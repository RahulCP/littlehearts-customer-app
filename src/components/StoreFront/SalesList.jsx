import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Pagination, PaginationItem } from "@mui/material";
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
import { ArrowCircleLeft, ArrowCircleRight } from "@mui/icons-material";

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

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allProducts.slice(start, start + itemsPerPage);
  }, [allProducts, currentPage]);

  const handlePageChange = (event, value) => setCurrentPage(value);

  /* -------------------- navigation -------------------- */
  const viewProductDetails = (productUid, itemUid) => {
    const qs = itemUid ? `?itemUid=${encodeURIComponent(itemUid)}` : "";
    navigate(`/store/${effectiveSlug}/product/${encodeURIComponent(productUid)}${qs}`);
  };

  return (
    <Box>
      {/* Top pagination */}
      <Grid
        container
        alignItems="center"
        justifyContent="flex-end"
        sx={{ height: { xs: "40px", md: "60px" }, mb: { xs: 2, md: 2 } }}
      >
        <Pagination
          count={pageCount || 1}
          page={currentPage}
          onChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              components={{ previous: ArrowCircleLeft, next: ArrowCircleRight }}
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize:
                  item.type === "previous" || item.type === "next" ? "30px" : "20px",
                "& svg": { fontSize: "30px" },
                color:
                  item.type === "previous" || item.type === "next"
                    ? item.disabled
                      ? "gray"
                      : "teal"
                    : item.selected
                    ? "red"
                    : "black",
              }}
            />
          )}
          sx={{
            maxWidth: 320,
            "& .MuiPaginationItem-root": { minWidth: 26, height: 26, mx: "3px" },
            "& .Mui-selected": { fontWeight: "bold", backgroundColor: "transparent" },
          }}
        />
      </Grid>

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
      <Grid container justifyContent="center" mt={3}>
        <Pagination
          count={pageCount || 1}
          page={currentPage}
          onChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              components={{ previous: ArrowCircleLeft, next: ArrowCircleRight }}
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize:
                  item.type === "previous" || item.type === "next" ? "30px" : "20px",
                "& svg": { fontSize: "30px" },
                color:
                  item.type === "previous" || item.type === "next"
                    ? item.disabled
                      ? "gray"
                      : "teal"
                    : item.selected
                    ? "red"
                    : "black",
              }}
            />
          )}
        />
      </Grid>

      {loading && (
        <Box sx={{ mt: 2, opacity: 0.7, textAlign: "center" }}>Loading…</Box>
      )}
    </Box>
  );
};

export default SalesList;
