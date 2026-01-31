import React, { useMemo } from "react";
import { buildImageUrl } from "../../utils/imageHelpers";
import "./ProductImageSingle.css";

const ProductImageSingle = ({ image, alt }) => {
  const src = useMemo(() => {
    if (!image) return null;
    return buildImageUrl(image);
  }, [image]);

  return (
    <div className="pisWrap">
      {src ? (
        <img className="pisImg" src={src} alt={alt || "product"} loading="lazy" />
      ) : (
        <div className="pisEmpty">No Image</div>
      )}
    </div>
  );
};

export default ProductImageSingle;
