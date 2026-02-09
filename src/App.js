import React, { useState, useEffect, useContext, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Box, Container, CircularProgress } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import MenuBar from "./components/MenuBar/MenuBar";
import GlobalProvider from "./GlobalProvider";
import WelcomePage from "./components/WelcomePage/WelcomePage";
import HeaderGrid from "./components/Header/HeaderGrid";
import { ToastProvider } from "./utility-v1/ToastProvider";
import GoogleLoginComponent from "./utility-v1/GoogleLoginComponent";

// Storefront (customer-facing)
import StoreProductsNew from "./components/StoreFront/SalesList";
import StoreProductDetails from "./components/StoreProducts/ProductDetails";
import MyCart from "./components/mycart/MyCart";
import Checkout from "./components/checkout/Checkout";

const ImageCacheContext = createContext();
export const useImageCache = () => useContext(ImageCacheContext);

const dummyUser = {
  id: "123456",
  name: "John Doe",
  email: "johndoe@example.com",
  role: "admin",
};

/* =====================================================
   HeaderGrid wrapper (ONLY for /store/:slug/*)
   ===================================================== */
const HeaderGridWrapper = ({ allItems }) => {
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean);

  // Expected paths:
  // /store/illolam
  // /store/illolam/products
  // /store/illolam/product/xxx

  if (pathArray[0] !== "store") return null;

  const storeSlug = pathArray[1];
  if (!storeSlug) return null;

  return (
    <HeaderGrid
      pathArray={pathArray}
      storeSlug={storeSlug}
      allItems={allItems}
      content=""
      additionalContent={null}
    />
  );
};

function App() {
  const [allItems] = useState([]);
  const [imageCache] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  /* =====================================================
     Load user (dummy for now)
     ===================================================== */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(dummyUser);
      }
    } else {
      setUser(dummyUser);
    }
  }, []);

  /* =====================================================
     App bootstrap
     ===================================================== */
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ImageCacheContext.Provider value={imageCache}>
      <Router>
        <CssBaseline />
        <GlobalProvider>
          <Container maxWidth="xl">
            <ToastProvider>
              <MenuBar allItems={allItems} />
              <HeaderGridWrapper allItems={allItems} />

              <Box>
                <Routes>
                  {/* Landing */}
                  <Route path="/" element={<WelcomePage />} />

                  {/* Login */}
                  <Route
                    path="/ammulogin"
                    element={<GoogleLoginComponent setUserParent={setUser} />}
                  />

                  {/* ================= STORE FRONT ================= */}

                  {/* ✅ IMPORTANT: handle /store/:slug */}
                  <Route
                    path="/store/:slug"
                    element={<Navigate to="products" replace />}
                  />

                  <Route
                    path="/store/:slug/products"
                    element={<StoreProductsNew />}
                  />

                  <Route
                    path="/store/:slug/product/:productUid"
                    element={<StoreProductDetails />}
                  />

                  <Route
                    path="/store/:slug/my-cart"
                    element={<MyCart />}
                  />

                  <Route
                    path="/store/:slug/checkout"
                    element={<Checkout />}
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </ToastProvider>
          </Container>
        </GlobalProvider>
      </Router>
    </ImageCacheContext.Provider>
  );
}

export default App;
