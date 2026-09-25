import React from "react";

// Same font stack used by the rest of the site
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.ost {
  width: 100%;
  font-family: ${FONT};
  overflow: hidden;
}

.ost *,
.ost *::before,
.ost *::after {
  box-sizing: border-box;
}

/* =========================================================
   MAIN GRID
   ========================================================= */

.ost__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
}

/* =========================================================
   LEFT TEXT PANEL
   ========================================================= */

.ost__panel {
  background: #F7F4EF;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  padding: clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px);

  gap: clamp(28px, 4vw, 48px);
}

/* Nimie mark */
.ost__mark {
  display: block;

  width: clamp(130px, 17vw, 220px);
  height: auto;

  flex-shrink: 0;
}

/* Description */
.ost__text {
  margin: 0;

  width: 100%;
  max-width: 48ch;

  font-size: clamp(14px, 1.15vw, 17px);
  font-weight: 400;
  line-height: 1.7;

  color: #2c2c2c;
}

/* =========================================================
   IMAGE
   ========================================================= */

.ost__media {
  position: relative;
  width: 100%;
  overflow: hidden;

  /* Mobile image height */
  height: min(100vw, 520px);
}

.ost__img {
  display: block;

  width: 100%;
  height: 100%;

  max-width: none;

  object-fit: cover;
  object-position: center center;
}

/* =========================================================
   TABLET + DESKTOP
   ========================================================= */

@media (min-width: 768px) {
  .ost__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    /*
      Keep the entire component inside the viewport.

      svh is used instead of vh because it behaves better
      with browser UI on different devices.
    */
    height: min(
      900px,
      calc(100svh - 80px)
    );

    min-height: 500px;
  }

  .ost__panel {
    height: 100%;
  }

  .ost__media {
    height: 100%;
  }

  .ost__img {
    height: 100%;
    width: 100%;

    object-fit: cover;
    object-position: center center;
  }
}

/* =========================================================
   LARGE DESKTOP
   ========================================================= */

@media (min-width: 1440px) {
  .ost__grid {
    height: min(
      900px,
      calc(100svh - 90px)
    );
  }

  .ost__panel {
    padding-left: clamp(60px, 6vw, 110px);
    padding-right: clamp(60px, 6vw, 110px);
  }

  .ost__mark {
    width: clamp(170px, 15vw, 240px);
  }

  .ost__text {
    max-width: 50ch;
    font-size: clamp(15px, 1vw, 17px);
  }
}

/* =========================================================
   VERY SMALL MOBILE
   ========================================================= */

@media (max-width: 480px) {
  .ost__panel {
    padding: 48px 24px 52px;
    gap: 28px;
  }

  .ost__mark {
    width: 140px;
  }

  .ost__media {
    height: 100vw;
    min-height: 360px;
    max-height: 520px;
  }
}
`;

export function OurStoryHero({
  logoMark,
  logoMarkAlt = "Nimie",
  description,
  image,
  imageAlt,
}) {
  return (
    <section className="ost" aria-label="Our story">
      <style>{css}</style>

      <div className="ost__grid">

        {/* =========================
            LEFT — BRAND + DESCRIPTION
        ========================= */}
        <div className="ost__panel">
          <img
            className="ost__mark"
            src={logoMark}
            alt={logoMarkAlt}
          />

          <p className="ost__text">
            {description}
          </p>
        </div>

        {/* =========================
            RIGHT — HERO IMAGE
        ========================= */}
        <div className="ost__media">
          <img
            className="ost__img"
            src={image}
            alt={imageAlt}
          />
        </div>

      </div>
    </section>
  );
}