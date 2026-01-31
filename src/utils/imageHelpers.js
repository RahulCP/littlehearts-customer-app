// src/utils/imageHelpers.js
import { IMAGE_URL } from "../config/constants";

/**
 * Safely builds a full image URL from a relative path.
 */
export const buildImageUrl = (imgPath) => {
  if (!imgPath) return null;

  const cleanPath = imgPath.startsWith("/") ? imgPath.substring(1) : imgPath;

  const cleanBase = IMAGE_URL.endsWith("/")
    ? IMAGE_URL.slice(0, -1)
    : IMAGE_URL;

  return `${cleanBase}/${cleanPath}`;
};

/**
 * Safely normalize array of product images.
 */
export const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map((img) => buildImageUrl(img));
};
