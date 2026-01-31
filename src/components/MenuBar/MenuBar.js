// src/components/MenuBar/MenuBar.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Container,
  Grid,
  Button,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";

import SearchDrawer from "../SalesRecordPage/SearchDrawer";
import SearchWithDropdown from "../SalesRecordPage/SearchWithDropdown";
import LogoAnimation from "./LogoAnimation";
import MovingMenu from "./MovingMenu";
import MobileDrawerMenu from "./MobileDrawerMenu";
import { useMediaQuery } from "@mui/material";
import { API_BASE_URL } from "../../config/constants";
import axios from "axios";

// ✅ new separated auth UI
import CustomerAuthButtons from "../../auth/CustomerAuthButtons";

/* ---------------- auth helpers (match CustomerAuthButtons storage keys) ---------------- */
function getStoreCustomerToken(storeSlug) {
  if (!storeSlug) return null;
  try {
    return localStorage.getItem(`store_customer_token_${storeSlug}`);
  } catch {
    return null;
  }
}

const MenuBar = ({ allItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchItems, setSearchItems] = useState(allItems || []);

  // ✅ forces auth re-check when login/logout happens
  const [authTick, setAuthTick] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const drawerRef = useRef(null);

  // ----------------------------
  // Derive store slug from URL
  // ----------------------------
  const pathArray = location.pathname.split("/").filter(Boolean);
  const firstSegment = pathArray[0] || null;
  const reserved = ["ammulogin", "admin", "products"]; // non-store routes
  const storeSlug = reserved.includes(firstSegment) ? null : firstSegment;

  // ----------------------------
  // Detect customer login (store-scoped)
  // ----------------------------
  const isCustomerLoggedIn = useMemo(() => {
    void authTick;
    const token = getStoreCustomerToken(storeSlug);
    return !!token;
  }, [storeSlug, authTick]);

  // Refresh auth status when route changes (common after login)
  useEffect(() => {
    setAuthTick((t) => t + 1);
  }, [location.pathname]);

  // Refresh auth status when auth changes (same tab + other tabs)
  useEffect(() => {
    const onStorage = () => setAuthTick((t) => t + 1);
    const onAuthChanged = () => setAuthTick((t) => t + 1);

    window.addEventListener("storage", onStorage);
    window.addEventListener("customer-auth-changed", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("customer-auth-changed", onAuthChanged);
    };
  }, []);

  // ----------------------------
  // Fetch categories from API
  // ----------------------------
  useEffect(() => {
    if (!storeSlug) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/store/${storeSlug}/categories`
        );
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error loading categories for store:", storeSlug, err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [storeSlug]);

  // ----------------------------
  // Fetch products for search (per store)
  // ----------------------------
  useEffect(() => {
    const loadSearchItems = async () => {
      if (!storeSlug) {
        setSearchItems(allItems || []);
        return;
      }

      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/store/${storeSlug}/storeproducts`,
          { params: { limit: 200, offset: 0 } }
        );
        setSearchItems(Array.isArray(data?.products) ? data.products : []);
      } catch (err) {
        console.error(
          "Error loading products for search, falling back to allItems:",
          err
        );
        setSearchItems(allItems || []);
      }
    };

    loadSearchItems();
  }, [storeSlug, allItems]);

  // ----------------------------
  // Build menu items dynamically
  // ----------------------------
  const menuItems = [];

  if (storeSlug) {
    menuItems.push({ text: "All Items", href: `/${storeSlug}/products` });

    categories.forEach((cat) => {
      menuItems.push({
        text: cat.name,
        href: `/${storeSlug}/products?categoryId=${cat.id}`,
      });
    });

    // ✅ show only when customer token exists for this store
    if (isCustomerLoggedIn) {
      menuItems.push({ text: "My Orders", href: `/${storeSlug}/my-orders` });
    }

    menuItems.push({ text: "My Cart", href: `/${storeSlug}/my-cart` });
  } else {
    menuItems.push({ text: "All Stores", href: "/" });
  }

  const mobileMenuItems = menuItems;

  // ----------------------------
  // Search selection handler
  // ----------------------------
  const handleSearchSelect = (item) => {
    if (!item) return;

    if (storeSlug && item.product_uid) {
      navigate(`/${storeSlug}/product/${item.product_uid}`);
      setIsSearchModalOpen(false);
      return;
    }

    if (item.inventoryid) {
      window.location.href = `/jewels/list/All/${item.inventoryid}?ref=view`;
      setIsSearchModalOpen(false);
      return;
    }

    setIsSearchModalOpen(false);
  };

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const handleLogoClick = () => {
    if (storeSlug) navigate(`/${storeSlug}/products`);
    else navigate("/");
  };

  const handleHomeClick = () => {
    if (storeSlug) navigate(`/${storeSlug}/products`);
    else navigate("/");
  };

  const handleCartClick = () => {
    if (storeSlug) navigate(`/${storeSlug}/my-cart`);
    else navigate("/my-cart");
  };

  // Optional: drawer text animation if you still use anime.js
  useEffect(() => {
    if (mobileOpen && drawerRef.current && window.anime) {
      window.anime
        .timeline({ loop: false })
        .add({
          targets: ".mobile-letter",
          translateY: ["1.2em", "0"],
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 750,
          delay: (el, i) => 70 * i,
        });
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          backgroundColor: "#fff",
          boxShadow: "none",
          height: { xs: "60px", md: "80px" },
          borderBottom: "1px solid #ccc",
        }}
      >
        <Container maxWidth="xxl">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              {/* Logo (Left) */}
              <Grid item xs={3} md={2}>
                <Box onClick={handleLogoClick} sx={{ cursor: "pointer" }}>
                  <LogoAnimation />
                </Box>
              </Grid>

              {/* Search Bar (Desktop) */}
              <Grid
                item
                md={2}
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <SearchWithDropdown
                  onSelectItem={handleSearchSelect}
                  itemsList={searchItems}
                />
              </Grid>

              {/* Desktop Menu + Login (Right) */}
              <Grid
                item
                md={8}
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <MovingMenu menuItems={menuItems} />

                {/* ✅ Auth area (Desktop) */}
                <CustomerAuthButtons storeSlug={storeSlug} variant="desktop" />
              </Grid>

              {/* Icons (Right) - Mobile only */}
              {isSmallScreen && (
                <Grid
                  item
                  xs={9}
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                  >
                    <IconButton
                      color="inherit"
                      onClick={handleHomeClick}
                      sx={{ color: "black", mr: 1 }}
                    >
                      <HomeIcon sx={{ fontSize: 25 }} />
                    </IconButton>

                    <IconButton
                      color="inherit"
                      onClick={handleCartClick}
                      sx={{ mr: 1 }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: 25 }} />
                    </IconButton>

                    <IconButton
                      color="inherit"
                      onClick={openSearchModal}
                      sx={{ mr: 1 }}
                    >
                      <SearchIcon sx={{ fontSize: 25 }} />
                    </IconButton>

                    {/* ✅ Auth icon (Mobile) */}
                    <CustomerAuthButtons storeSlug={storeSlug} variant="mobile" />

                    <IconButton
                      color="inherit"
                      onClick={handleDrawerToggle}
                      sx={{ mr: -2 }}
                    >
                      <MenuIcon sx={{ fontSize: 35 }} />
                    </IconButton>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawerMenu
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        menuItems={mobileMenuItems}
      />

      {/* Search Drawer (Mobile / top) */}
      <SearchDrawer
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        onSelectItem={handleSearchSelect}
        itemsList={searchItems}
      />

      {/* Spacer for AppBar */}
      <Box sx={{ mt: { xs: "60px", md: "80px" } }} />

      {/* Floating WhatsApp Chat Button */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          href="https://wa.me/917907448913?text=Hi, I need help."
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderRadius: "30px",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: 3,
          }}
        >
          Chat
        </Button>
      </Box>
    </>
  );
};

export default MenuBar;
