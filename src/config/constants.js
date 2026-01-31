// src/config/constants.js

const HOST = window.location.hostname;     // e.g. 192.168.1.38 or localhost
const PROTOCOL = window.location.protocol; // http: or https:

// ✅ these ports are your services
const API_HOST = `${PROTOCOL}//${HOST}:5005`;
const IMG_HOST = `${PROTOCOL}//${HOST}:5002`;

export const API_BASE_URL = `${API_HOST}/api`;
export const IMAGE_BASE_URL = `${IMG_HOST}/img`;
export const IMAGE_URL = `${IMG_HOST}/img`;

export const APPIMAGE_BASE_URL = "https://illolam.com/appimg";
export const PICKUP_NAME = "Anjana artech";
export const SELLER_GSTIN = "32AJNPA9627K1Z0";
