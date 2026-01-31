// src/App.js
import React, { useState, useEffect, useContext, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Box, Container, CircularProgress } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import MenuBar from "./components/MenuBar/MenuBar";
import GlobalProvider from "./GlobalProvider";
import WelcomePage from "./components/WelcomePage/WelcomePage";
import HeaderGrid from "./components/Header/HeaderGrid";
import { API_BASE_URL } from "./config/constants";
import { ToastProvider } from "./utility-v1/ToastProvider";
import GoogleLoginComponent from "./utility-v1/GoogleLoginComponent";
import PrivateRoute from "./PrivateRoute";

// Storefront components (customer-facing)
import StoreProductDetails from "./components/StoreProducts/ProductDetails";
import MyCart from "./components/mycart/MyCart";
import Checkout from "./components/checkout/Checkout";

// Storefront components (customer-facing)
import StoreProductsNew from "./components/StoreFront/SalesList";

const ImageCacheContext = createContext();
export const useImageCache = () => useContext(ImageCacheContext);

const dummyUser = {
  id: "123456",
  name: "John Doe",
  email: "johndoe@example.com",
  role: "admin",
  avatar: "https://via.placeholder.com/150",
};

const HeaderGridWrapper = ({ user, allItems }) => {
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean);
  // examples:
  // "/"                        -> []
  // "/rare"                    -> ["rare"]
  // "/rare/product/abc"        -> ["rare","product","abc"]
  // "/ammulogin"               -> ["ammulogin"]
  // "/admin/stores"            -> ["admin","stores"]

  if (pathArray.length === 0) return null;

  const first = pathArray[0];

  // Reserved top-level routes that are NOT store slugs
  const reserved = ["ammulogin", "products", "admin"];

  if (reserved.includes(first)) return null;

  const storeSlug = first; // e.g. "rare"

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
  const [allItems, setAllItems] = useState([]);
  const [imageCache, setImageCache] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Load user from sessionStorage or fallback to dummy
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from sessionStorage:", error);
        setUser(dummyUser);
      }
    } else {
      setUser(dummyUser);
    }
  }, []);

  // Fetch items once (for your old Illolam list, search, etc.)
  useEffect(() => {
    const fetchAndCacheImages = async () => {
      try {
      //  const response = await fetch(`${API_BASE_URL}/filtered-items`);
        const data = await response.json();
//
        // If you want to re-enable actual image caching, use setImageCache here
       // setAllItems(data);
      } catch (error) {
        console.error("Error fetching items or caching images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCacheImages();
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
              <HeaderGridWrapper user={user} allItems={allItems} />

              <Box>
                <Routes>
                  {/* Home / Landing */}
                  <Route path="/" element={<WelcomePage />} />
                  {/* Login */}
                  <Route
                    path="/ammulogin"
                    element={<GoogleLoginComponent setUserParent={setUser} />}
                  />
                  <Route path="/:slug/products" element={<StoreProductsNew />} />
                  <Route path="/:slug/my-cart" element={<MyCart />} />
                  <Route path="/:slug/checkout" element={<Checkout />} />

                  <Route
                    path="/:slug/product/:productUid"
                    element={<StoreProductDetails />}
                  />
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
