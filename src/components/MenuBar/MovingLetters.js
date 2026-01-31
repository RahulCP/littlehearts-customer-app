import React, { useEffect, useRef } from "react";
import anime from "animejs";
import "./MovingLetters.css"; // Import CSS for styling

const MovingLetters = () => {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Wrap every letter in a span
    const textWrapper = textRef.current;
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline({ loop: true })
      .add({
        targets: ".ml1 .letter",
        scale: [0.3, 1],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 600,
        delay: (el, i) => 70 * (i + 1)
      })
      .add({
        targets: ".ml1 .line",
        scaleX: [0, 1],
        opacity: [0.5, 1],
        easing: "easeOutExpo",
        duration: 700,
        offset: "-=875",
        delay: (el, i, l) => 80 * (l - i)
      })
      .add({
        targets: ".ml1",
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      });
  }, []);

  return (
    <div className="ml1">
      <span className="text-wrapper">
        <span ref={textRef} className="letters">Illolam Jewels</span>
        <span className="line"></span>
      </span>
    </div>
  );
};

export default MovingLetters;
