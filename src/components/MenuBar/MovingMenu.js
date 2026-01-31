import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import "./MovingMenu.css";

const MovingMenu = ({ menuItems }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate(); // React Router Navigation

  useEffect(() => {
    if (!menuRef.current) return;

    // Wrap letters in spans for animation
    document.querySelectorAll(".ml1 .letters").forEach((el) => {
      el.innerHTML = el.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
    });

    // One-time letter animation
    anime.timeline()
      .add({
        targets: ".ml1 .letter",
        translateY: ["1.2em", 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 500,
        delay: (el, i) => 5 * (i + 1),
      });

    // Line redraw every 20 seconds
    const drawLines = () => {
      anime({
        targets: ".menu-item-line",
        scaleX: [0, 1],
        opacity: [1, 1],
        easing: "easeInOutQuad",
        duration: 400,
        delay: anime.stagger(200),
      });
    };

    drawLines();
    const interval = setInterval(drawLines, 40000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav ref={menuRef} className="moving-menu">
      {menuItems.map((item, index) => (
        <div 
          key={index} 
          className="menu-item" 
          onClick={() => window.location.href = item.href} // Full page reload
          style={{ cursor: "pointer" }} // Ensure pointer cursor for clarity
        >
          <span className="ml1"><span className="letters">{item.text}</span></span>
          <span className="menu-item-line top"></span>
          <span className="menu-item-line bottom"></span>
        </div>
      ))}
    </nav>
  );
};

export default MovingMenu;
