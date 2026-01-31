// src/components/storefront/ProductImageCarousel.jsx
import React, { useEffect, useState } from "react";
import { buildImageUrl } from "../../utils/imageHelpers";

const ProductImageCarousel = ({ images = [], alt }) => {
  const validImages = Array.isArray(images) ? images : [];
  const [index, setIndex] = useState(0);

  const hasImages = validImages.length > 0;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  // Auto-play every 3 seconds
  useEffect(() => {
    if (!hasImages) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % validImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [hasImages, validImages.length]);

  const currentImage = hasImages ? buildImageUrl(validImages[index]) : null;

  const next = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % validImages.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  return (
    <div style={{ width: "100%", height: 150, position: "relative" }}>
      {currentImage ? (
        <img
          src={currentImage}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#eee",
            borderRadius: 6,
            textAlign: "center",
            paddingTop: 60,
          }}
        >
          No Image
        </div>
      )}

      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: "absolute",
              left: 5,
              top: "40%",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 25,
              height: 25,
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          <button
            onClick={next}
            style={{
              position: "absolute",
              right: 5,
              top: "40%",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 25,
              height: 25,
              cursor: "pointer",
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;
