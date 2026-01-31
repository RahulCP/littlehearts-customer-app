// src/components/auth/CustomerAuthButtons.jsx
import React, { useMemo, useState } from "react";
import { Box, Button, IconButton, Avatar, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";

import { API_BASE_URL } from "../config/constants";
import {
  loginWithGoogle,
  logout as firebaseLogout,
  getAuthUser,
} from "./firebaseAuth";

/**
 * Reusable auth UI for storefront/admin header areas.
 * - Handles Google login (firebase) + backend customer sync (per storeSlug)
 * - Stores token/customer in localStorage scoped by storeSlug
 *
 * Props:
 * - storeSlug: string | null
 * - variant: "desktop" | "mobile"
 * - onAuthUserChange?: (userOrNull) => void
 */
export default function CustomerAuthButtons({
  storeSlug,
  variant = "desktop",
  onAuthUserChange,
}) {
  const [authUser, setAuthUser] = useState(() => getAuthUser());

  const isLoggedIn = !!authUser;

  const keys = useMemo(() => {
    if (!storeSlug) return null;
    return {
      tokenKey: `store_customer_token_${storeSlug}`,
      customerKey: `store_customer_${storeSlug}`,
    };
  }, [storeSlug]);

  const handleLogin = async () => {
    try {
      // 1) Firebase login
      const { idToken, profile } = await loginWithGoogle();

      setAuthUser(profile);
      onAuthUserChange?.(profile);

      // 2) If inside a store page, sync/create customer in backend
      if (storeSlug) {
        const { data } = await axios.post(
          `${API_BASE_URL}/store/${storeSlug}/auth/google`,
          { idToken }
        );

        // 3) Store backend session (store-scoped)
        if (keys) {
          localStorage.setItem(keys.tokenKey, data.token);
          localStorage.setItem(keys.customerKey, JSON.stringify(data.customer));
        }
      }
    } catch (e) {
      console.error("Google login failed:", e);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      setAuthUser(null);
      onAuthUserChange?.(null);

      // clear store-scoped session
      if (keys) {
        localStorage.removeItem(keys.tokenKey);
        localStorage.removeItem(keys.customerKey);
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // ---------------- UI ----------------
  if (variant === "mobile") {
    return !isLoggedIn ? (
      <IconButton color="inherit" onClick={handleLogin} title="Login">
        <LoginIcon sx={{ fontSize: 25 }} />
      </IconButton>
    ) : (
      <IconButton color="inherit" onClick={handleLogout} title="Logout">
        <LogoutIcon sx={{ fontSize: 25 }} />
      </IconButton>
    );
  }

  // desktop
  return !isLoggedIn ? (
    <Button
      variant="outlined"
      size="small"
      startIcon={<LoginIcon />}
      onClick={handleLogin}
      sx={{
        textTransform: "none",
        borderRadius: 2,
        borderColor: "#1b5e20",
        color: "#1b5e20",
        fontWeight: 600,
      }}
    >
      Login
    </Button>
  ) : (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar
        src={authUser.photoUrl || ""}
        alt={authUser.name || authUser.email || "User"}
        sx={{ width: 28, height: 28 }}
      />
      <Typography sx={{ fontSize: 13, maxWidth: 180 }} noWrap>
        {authUser.name || authUser.email}
      </Typography>
      <Button
        variant="text"
        size="small"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ textTransform: "none" }}
      >
        Logout
      </Button>
    </Box>
  );
}
