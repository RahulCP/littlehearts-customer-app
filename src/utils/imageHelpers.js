// src/utils/imageHelpers.js
import { V2IMG_BASE_URL } from "../config/constants";

/**
 * Build a full image URL from a storageKey or partial path.
 *
 * Accepts:
 *  - stores/illolam/products/xxx.jpg
 *  - /stores/illolam/products/xxx.jpg
 *  - already-full https://...
 */
export const buildImageUrl = (imgPath) => {
  if (!imgPath) return "";

  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(imgPath)) {
    return imgPath;
  }

  // Normalize path
  const cleanPath = String(imgPath)
    .trim()
    .replace(/^\/+/, "")     // remove leading /
    .replace(/^v2img\//, ""); // avoid double v2img

  return `${V2IMG_BASE_URL}/${cleanPath}`;
};

/**
 * Normalize an array of image paths/storageKeys
 */
export const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map(buildImageUrl).filter(Boolean);
};
