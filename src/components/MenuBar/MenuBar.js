// src/components/MenuBar/MenuBar.jsx
import React, { useState, useEffect, useRef } from "react";
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

const TABLET_UP = "@media (min-width:768px)";
const DESKTOP_UP = "@media (min-width:1025px)";

const MenuBar = ({ allItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [searchItems, setSearchItems] = useState(allItems || []);
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width:767px)");
  const isCompactSearch = useMediaQuery("(max-width:1024px)");
  const drawerRef = useRef(null);

  // ----------------------------
  // ✅ Derive store slug from /store/:slug/... and public /:slug entry
  // ----------------------------
  const pathArray = location.pathname.split("/").filter(Boolean);

  // examples:
  // "/store/illolam/products" -> ["store","illolam","products"]
  // "/illolam"                -> ["illolam"]
  // "/ammulogin"              -> ["ammulogin"]
  // "/"                       -> []
  const storeSlug =
    pathArray[0] === "store"
      ? pathArray[1] || null
      : pathArray.length === 1 && pathArray[0] !== "ammulogin"
      ? pathArray[0]
      : null;

  const isStoreWelcomePage =
    !!storeSlug &&
    ((pathArray[0] === "store" && pathArray.length === 2) ||
      (pathArray[0] !== "store" && pathArray.length === 1));

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

  useEffect(() => {
    if (!storeSlug) {
      setActiveOffers([]);
      return;
    }

    const fetchActiveOffers = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/store/${storeSlug}/product-offers/active`
        );
        setActiveOffers(Array.isArray(data?.offers) ? data.offers : []);
      } catch (err) {
        console.error("Error loading active offers for store:", storeSlug, err);
        setActiveOffers([]);
      }
    };

    fetchActiveOffers();
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
    if (!isStoreWelcomePage) {
      menuItems.push({ text: "Home", href: `/store/${storeSlug}` });
    }
    menuItems.push({ text: "All Items", href: `/store/${storeSlug}/products` });

    categories.forEach((cat) => {
      menuItems.push({
        text: cat.name,
        href: `/store/${storeSlug}/products?categoryId=${cat.id}`,
      });
    });

    activeOffers.forEach((offer) => {
      const name = offer.badge_text || offer.name;
      if (!name || !offer.offer_uid) return;
      menuItems.push({
        text: name,
        href: `/store/${storeSlug}/products?offerUid=${encodeURIComponent(offer.offer_uid)}`,
      });
    });

    menuItems.push({ text: "My Orders", href: `/store/${storeSlug}/my-orders`, priority: true });

    if (!isStoreWelcomePage) {
      menuItems.push({ text: "My Cart", href: `/store/${storeSlug}/my-cart` });
    }
  } else {
    menuItems.push({ text: "All Stores", href: "/" });
  }

  const mobileMenuItems = menuItems;
  const desktopCategoryItems = storeSlug
    ? [
        { text: "All Items", href: `/store/${storeSlug}/products` },
        ...categories.map((cat) => ({
          text: cat.name,
          href: `/store/${storeSlug}/products?categoryId=${cat.id}`,
        })),
      ]
    : menuItems;

  const desktopOfferItems = storeSlug
    ? activeOffers
        .map((offer) => {
          const text = offer.badge_text || offer.name;
          if (!text || !offer.offer_uid) return null;
          return {
            text,
            href: `/store/${storeSlug}/products?offerUid=${encodeURIComponent(offer.offer_uid)}`,
          };
        })
        .filter(Boolean)
    : [];

  // ----------------------------
  // Search selection handler
  // ----------------------------
  const handleSearchSelect = (item) => {
    if (!item) return;

    if (storeSlug && item.product_uid) {
      navigate(`/store/${storeSlug}/product/${item.product_uid}`);
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
  const handleDesktopCategoryToggle = () => setDesktopCategoryOpen((prev) => !prev);
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const handleLogoClick = () => {
    if (storeSlug) navigate(`/store/${storeSlug}`);
    else navigate("/");
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
          height: {
            xs: storeSlug ? "108px" : "60px",
            [TABLET_UP]: storeSlug ? "128px" : "80px",
            md: storeSlug ? "128px" : "80px",
          },
          borderBottom: "1px solid #ccc",
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 3, sm: 3.5, md: 4 },
            [DESKTOP_UP]: {
              maxWidth: "none",
              px: 3,
            },
          }}
        >
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", minHeight: { xs: "60px", [TABLET_UP]: "80px", md: "80px" } }}
          >
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: "100%", position: "relative" }}
            >
              {/* Logo (Left) */}
              <Grid
                item
                xs={3}
                md={2}
                sx={{
                  [TABLET_UP]: {
                    flexBasis: "16.666667%",
                    maxWidth: "16.666667%",
                  },
                }}
              >
                <Box onClick={handleLogoClick} sx={{ cursor: "pointer" }}>
                  <LogoAnimation />
                </Box>
              </Grid>

              {/* Desktop actions (Right) */}
              <Grid
                item
                md={10}
                sx={{
                  display: { xs: "none", md: "flex" },
                  [TABLET_UP]: {
                    display: "flex",
                    flexBasis: "83.333333%",
                    maxWidth: "83.333333%",
                  },
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!isCompactSearch ? (
                  <Box sx={{ width: 360, flex: "0 1 360px" }}>
                    <SearchWithDropdown
                      onSelectItem={handleSearchSelect}
                      itemsList={searchItems}
                    />
                  </Box>
                ) : null}

                {storeSlug ? (
                  <>
                    <Button
                      size="small"
                      startIcon={<MenuIcon />}
                      onClick={handleDesktopCategoryToggle}
                      sx={{
                        textTransform: "none",
                        fontWeight: 900,
                        color: "#374151",
                        border: "1px solid #e5e7eb",
                        bgcolor: "#f3f4f6",
                        borderRadius: 1.5,
                        px: 1.2,
                        "&:hover": { bgcolor: "#e5e7eb" },
                      }}
                    >
                      Categories
                    </Button>
                  </>
                ) : null}

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

        {storeSlug ? (
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 3, sm: 3.5, md: 4 },
              height: 48,
              width: "100%",
              boxSizing: "border-box",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.6, md: 1 },
                minWidth: 0,
                flex: 1,
                overflowX: "auto",
                whiteSpace: "nowrap",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {desktopOfferItems.map((offer) => (
                <Button
                  key={offer.href}
                  size="small"
                  onClick={() => navigate(offer.href)}
                  sx={{
                    flex: "0 0 auto",
                    textTransform: "none",
                    fontWeight: 900,
                    fontSize: { xs: 12.5, md: 13 },
                    color: "#374151",
                    borderRadius: 0,
                    px: { xs: 0, md: 0 },
                    py: 0.35,
                    minWidth: 0,
                    minHeight: 26,
                    bgcolor: "transparent",
                    "&:hover": { bgcolor: "transparent", color: "#111827" },
                  }}
                >
                  {offer.text}
                </Button>
              ))}
            </Box>

            {isCompactSearch ? (
              <IconButton
                color="inherit"
                onClick={openSearchModal}
                aria-label="Search items"
                sx={{ flex: "0 0 auto" }}
              >
                <SearchIcon sx={{ fontSize: 25 }} />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawerMenu
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        menuItems={mobileMenuItems}
      />

      <MobileDrawerMenu
        mobileOpen={desktopCategoryOpen}
        handleDrawerToggle={handleDesktopCategoryToggle}
        menuItems={desktopCategoryItems}
        title="Categories"
      />

      {/* Search Drawer (Mobile / top) */}
      <SearchDrawer
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        onSelectItem={handleSearchSelect}
        itemsList={searchItems}
      />

      {/* Spacer for AppBar */}
      <Box sx={{ mt: { xs: storeSlug ? "108px" : "60px", [TABLET_UP]: storeSlug ? "128px" : "80px", md: storeSlug ? "128px" : "80px" } }} />

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
