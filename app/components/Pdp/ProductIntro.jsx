import React, { useState } from "react";

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.product-intro {
  width: 100%;
  font-family: ${FONT};
  color: #ffffff;
}

.product-intro *,
.product-intro *::before,
.product-intro *::after {
  box-sizing: border-box;
}

/* =========================================
   MEDIA / HERO IMAGE
   ========================================= */

.product-intro__media {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #000000;
  height: clamp(420px, 58vw, 760px);
}

.product-intro__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-intro__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
}

/* =========================================
   TITLE
   ========================================= */

.product-intro__title-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 clamp(20px, 4vw, 40px);
}

.product-intro__title {
  margin: 0;

  text-align: center;
  font-weight: 400;

  font-size: clamp(36px, 6.5vw, 96px);
  line-height: 1.05;
  letter-spacing: -0.03em;

  color: #ffffff;
}

/* =========================================
   PAUSE / PLAY BUTTON
   ========================================= */

.product-intro__toggle {
  position: absolute;
  right: clamp(16px, 2vw, 20px);
  bottom: clamp(16px, 2vw, 20px);
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  border: none;
  border-radius: 3px;

  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);

  color: #ffffff;
  cursor: pointer;

  transition: background 0.2s ease;
}

.product-intro__toggle:hover {
  background: rgba(0, 0, 0, 0.5);
}

.product-intro__toggle-play {
  margin-left: 1px;
  font-size: 10px;
}

.product-intro__toggle-pause {
  display: flex;
  gap: 2px;
}

.product-intro__toggle-bar {
  width: 2px;
  height: 8px;
  background: #ffffff;
}

/* =========================================
   INFO MARQUEE STRIP
   ========================================= */

.product-intro__strip {
  position: relative;
  width: 100%;
  overflow: hidden;

  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: #f8f1df;

  padding: 16px 0;
}

.product-intro__track {
  display: flex;
  width: max-content;

  animation: product-intro-marquee 28s linear infinite;
  will-change: transform;
}

.product-intro__track--paused {
  animation-play-state: paused;
}

.product-intro__strip-item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  white-space: nowrap;

  font-size: clamp(12px, 1.2vw, 16px);
  font-weight: 400;
  letter-spacing: -0.01em;

  color: #171717;
}

.product-intro__strip-label {
  padding: 0 clamp(8px, 1vw, 12px);
}

@keyframes product-intro-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 767px) {
  .product-intro__media {
    border-radius: 12px 12px 0 0;
  }

  .product-intro__track {
    animation-duration: 22s;
  }
}

@media (max-width: 380px) {
  .product-intro__title {
    font-size: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-intro__track {
    animation: none;
  }
}
`;

export function ProductIntro({
  image,
  imageAlt = "Product image",
  title = "Halter Neck Heavy Chikankari",
  info = [],
}) {
  const [paused, setPaused] = useState(false);

  // Duplicate the items so the strip can scroll continuously.
  const infoItems = [...info, ...info];

  return (
    <section className="product-intro" aria-label={title}>
      <style>{css}</style>

      {/* Hero / background image */}
      <div className="product-intro__media">
        <img
          className="product-intro__image"
          src={image}
          alt={imageAlt}
        />

        <div className="product-intro__overlay" aria-hidden="true" />

        {/* Product name */}
        <div className="product-intro__title-wrap">
          <h1 className="product-intro__title">{title}</h1>
        </div>

        {/* Pause / play button */}
        <button
          type="button"
          className="product-intro__toggle"
          onClick={() => setPaused((value) => !value)}
          aria-label={
            paused ? "Play product information" : "Pause product information"
          }
        >
          {paused ? (
            <span className="product-intro__toggle-play">▶</span>
          ) : (
            <span className="product-intro__toggle-pause">
              <span className="product-intro__toggle-bar" />
              <span className="product-intro__toggle-bar" />
            </span>
          )}
        </button>
      </div>

      {/* Continuous product information strip */}
      <div className="product-intro__strip">
        <div
          className={`product-intro__track ${
            paused ? "product-intro__track--paused" : ""
          }`}
        >
          {infoItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="product-intro__strip-item"
            >
              <span className="product-intro__strip-label">{item}</span>
              <span aria-hidden="true">—</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}