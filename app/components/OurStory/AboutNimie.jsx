import React from "react";

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.about-nimie {
  width: 100%;
  font-family: ${FONT};
  background: #2F5723;
  color: #ffffff;
  border-radius: 4px;

  overflow: hidden;
}

.about-nimie *,
.about-nimie *::before,
.about-nimie *::after {
  box-sizing: border-box;
}

/* =========================================
   CONTENT WRAPPER
   ========================================= */

.about-nimie__inner {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  padding: clamp(48px, 7vw, 82px)
           clamp(24px, 5vw, 48px)
           clamp(52px, 7vw, 70px);
}

/* =========================================
   SMALL TOP LABEL
   ========================================= */

.about-nimie__eyebrow {
  margin: 0 0 clamp(22px, 3vw, 30px);

  font-size: clamp(9px, 0.75vw, 11px);
  font-weight: 400;
  line-height: 1.3;

  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: rgba(255, 255, 255, 0.9);
}

/* =========================================
   NIMIE LOGO
   ========================================= */

.about-nimie__logo {
  display: block;

  width: clamp(145px, 22vw, 205px);
  height: auto;

  margin-bottom: clamp(30px, 4vw, 40px);
}

/* =========================================
   MAIN HEADING
   ========================================= */

.about-nimie__title {
  margin: 0 0 clamp(10px, 1.5vw, 16px);

  font-size: clamp(14px, 1.25vw, 17px);
  font-weight: 700;

  line-height: 1.4;
  letter-spacing: 0.01em;

  color: #ffffff;
}

/* =========================================
   BODY TEXT
   ========================================= */

.about-nimie__text {
  width: 100%;
  max-width: 600px;

  margin: 0;

  font-size: clamp(13px, 1.05vw, 15px);
  font-weight: 400;

  line-height: 1.55;

  color: rgba(255, 255, 255, 0.95);
}

/* Space between the two paragraphs */

.about-nimie__text + .about-nimie__text {
  margin-top: clamp(18px, 2vw, 24px);
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 767px) {
  .about-nimie__inner {
    padding-top: 48px;
    padding-bottom: 52px;
  }

  .about-nimie__logo {
    width: 150px;
  }

  .about-nimie__text {
    max-width: 520px;
    line-height: 1.6;
  }
}

/* =========================================
   VERY SMALL MOBILE
   ========================================= */

@media (max-width: 380px) {
  .about-nimie__inner {
    padding-left: 20px;
    padding-right: 20px;
  }

  .about-nimie__logo {
    width: 135px;
  }

  .about-nimie__text {
    font-size: 13px;
  }
}
`;

export function AboutNimie({
  logoMark,
  logoMarkAlt = "Nimie",
}) {
  return (
    <section className="about-nimie" aria-labelledby="about-nimie-title">
      <style>{css}</style>

      <div className="about-nimie__inner">

        {/* Small section label */}
        <p className="about-nimie__eyebrow">
          ABOUT NIMIE™
        </p>

        {/* Nimie brand mark */}
        <img
          className="about-nimie__logo"
          src={logoMark}
          alt={logoMarkAlt}
        />

        {/* Main heading */}
        <h2
          id="about-nimie-title"
          className="about-nimie__title"
        >
          For The Love Of Where We Come From.
        </h2>

        {/* First paragraph */}
        <p className="about-nimie__text">
          The idea for NIMIE™ came about from a simple insight, genuine
          hand-embroidery needn't be reserved for weddings or festivals.
          We have taken the centuries-old, highly detailed craftsmanship
          from the heart of Lucknow and transformed it into simple, casual
          styles which blend easily into your contemporary way of life.
        </p>

        {/* Second paragraph */}
        <p className="about-nimie__text">
          No stiff rules, no heavy layers, and no waiting for a special
          occasion, just authentic heritage made to be lived in. We are
          building NIMIE™ for girls just like us.
        </p>

      </div>
    </section>
  );
}