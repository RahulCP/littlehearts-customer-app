// src/config/constants.js

const isBrowser = typeof window !== "undefined";

const HOST = isBrowser ? window.location.hostname : "localhost";
const PROTOCOL = isBrowser ? window.location.protocol : "http:";

// https → production (behind nginx)
// http  → development (direct ports)
const isProdBrowser = isBrowser && PROTOCOL === "https:";

/* =====================================================
   MAIN API (Node backend :5055 → /v2api)
   ===================================================== */
export const API_BASE_URL = isProdBrowser
  ? `${PROTOCOL}//${HOST}/v2api`
  : `${PROTOCOL}//${HOST}:5055/v2api`;

/* =====================================================
   IMAGE DISPLAY (static files)
   used ONLY for <img src="...">
   ===================================================== */
export const V2IMG_BASE_URL = isProdBrowser
  ? `${PROTOCOL}//${HOST}/v2img`
  : `${PROTOCOL}//${HOST}:5002/v2img`;

/* =====================================================
   IMAGE API (upload / list / delete)
   used for PUT/GET/DELETE requests
   ===================================================== */
export const V2IMG_API_BASE_URL = isProdBrowser
  ? `${PROTOCOL}//${HOST}/v2img/api`
  : `${PROTOCOL}//${HOST}:5002/api`;

/* =====================================================
   APP IMAGES (logos, banners, static app assets)
   ===================================================== */
export const APPIMAGE_BASE_URL = isProdBrowser
  ? `${PROTOCOL}//${HOST}/appimg`
  : `${PROTOCOL}//${HOST}:5002/appimg`;

/* =====================================================
   Backward compatibility (if old code uses this)
   ===================================================== */
export const IMAGE_BASE_URL = V2IMG_BASE_URL;
export const IMAGE_SERVER_URL = V2IMG_BASE_URL;
