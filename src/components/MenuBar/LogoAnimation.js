import React, { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { useMediaQuery, Box } from "@mui/material";
import "./LogoAnimation.css";
import { APPIMAGE_BASE_URL } from "../../config/constants";

// Define each letter's size and position
const letterProperties = [
  { name: "letter-i", width: 25, left: 0, top: 0 },
  { name: "letter-L", height: 30, left: 32, top: 18 },
  { name: "letter-L", height: 30, left: 60, top: 18 },
  { name: "letter-o", height: 35, left: 83, top: 14 }, // Special animation
  { name: "letter-inverted-L", height: 30, left: 125, top: 18 },
  { name: "letter-A", height: 30, left: 155, top: 18 },
  { name: "letter-M", height: 32, left: 190, top: 18 }
];

const LogoAnimation = () => {
  const logoRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Detect screen size for scaling
  const isXs = useMediaQuery("(max-width:600px)");
  const isSm = useMediaQuery("(min-width:601px) and (max-width:900px)");
  const isMd = useMediaQuery("(min-width:901px) and (max-width:1200px)");
  const isLg = useMediaQuery("(min-width:1201px)");

  // Adjust sizes based on screen
  const scaleFactor = isXs ? 0.6 : isSm ? 0.75 : isMd ? 0.9 : 1;

  useEffect(() => {
    if (!logoRef.current || imagesLoaded < letterProperties.length) return;

    anime.timeline({ loop: false })
      .add({
        targets: ".logo-letter img:not(.logo-special)", // All letters except the 4th one
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 800,
        delay: anime.stagger(270)
      })
      .add({
        targets: ".logo-letter .logo-special", // Special fading effect for letter "O"
        opacity: [0, 1],
        duration: 3000,
        easing: "easeInOutQuad"
      }, "-=600"); // Starts slightly earlier
  }, [imagesLoaded]);

  return (
    <Box
      ref={logoRef}
      className="logo-animation"
      sx={{
        position: "absolute",
        left: { xs: "0px", lg: "-5px" }, // Responsive positioning
        top: { xs: "12px", lg: "5px" }
      }}
    >
      <div className="logo-animation-text">
        {letterProperties.map((letter, index) => (
          <span key={index} className="logo-letter">
            <img
              className={index === 3 ? "logo-special" : ""} // Apply special class for 4th letter
              src={`${APPIMAGE_BASE_URL}/appimages/${letter.name}.png`}
              alt={letter.name}
              style={{
                width: `${letter.width * scaleFactor}px`,
                height: `${letter.height * scaleFactor}px`,
                position: "absolute",
                left: `${letter.left * scaleFactor}px`,
                top: `${letter.top * scaleFactor}px`
              }}
              onLoad={() => setImagesLoaded((prev) => prev + 1)}
              onError={(e) => console.error("Image not found:", e.target.src)}
            />
          </span>
        ))}
      </div>
    </Box>
  );
};

export default LogoAnimation;
