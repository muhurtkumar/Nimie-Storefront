import React from "react";

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
/* =========================================================
   ABOUT THE CURATOR
   ========================================================= */

.about-curator {
  width: 100%;
  box-sizing: border-box;
  font-family: ${FONT};

  max-width: 1350px;
  margin: 0 auto;

  padding-block: clamp(18px, 5vw, 56px);
  padding-inline: clamp(20px, 5vw, 40px);

  display: flex;
  align-items: flex-start;
  gap: clamp(28px, 5vw, 64px);
}

/* =========================================================
   PHOTO
   ========================================================= */

.about-curator__media {
  flex: 0 0 42%;
  max-width: 42%;
}

.about-curator__image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;

  border: 6px solid #f4ecd8;
  border-radius: 4px;
  box-sizing: border-box;
}

/* =========================================================
   TEXT CONTENT
   ========================================================= */

.about-curator__content {
  flex: 1 1 0%;
  min-width: 0;
}

.about-curator__eyebrow {
  margin: 0 0 clamp(12px, 2vw, 20px);
  color: #3f6b3f;
  font-size: clamp(11px, 1vw, 13px);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-curator__body {
  color: #1f2620;
}

.about-curator__body p {
  margin: 0 0 1.1em;
  font-size: clamp(15px, 1.3vw, 15px);
  line-height: 1.5;
  font-weight: 400;
}

.about-curator__body p:last-child {
  margin-bottom: 0;
}

/* =========================================================
   SIGNATURE
   ========================================================= */

.about-curator__sign {
  margin-top: clamp(18px, 3vw, 32px);
  display: flex;
  align-items: center;
  gap: 8px;
}

.about-curator__sign-image {
  height: clamp(44px, 5vw, 60px);
  width: auto;
  display: block;
}

.about-curator__sign-accent {
  width: clamp(64px, 8vw, 96px);
  height: auto;
  color: #c23b7a; /* swap via currentColor if you swap the swash */
  transform: translateY(4px);
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {
  .about-curator {
    gap: clamp(20px, 4vw, 36px);
  }
}

/* =========================================================
   MOBILE — stack photo above text
   ========================================================= */

@media (max-width: 800px) {
  .about-curator {
    flex-direction: column;
  }

  .about-curator__media {
    flex: 1 1 auto;
    max-width: 100%;
    width: 100%;
  }

  .about-curator__image {
    aspect-ratio: 4 / 3;
  }
}
`;

/* =========================================================
   DECORATIVE SIGNATURE SWASH
   (inline SVG so you don't need an extra image asset;
   pass a custom `signatureAccent` image instead if you'd
   rather use a designed one)
   ========================================================= */

function DefaultSignatureAccent() {
  return (
    <svg
      className="about-curator__sign-accent"
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 14 C 30 4, 70 4, 98 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

export function AboutCurator({
  image,
  imageAlt = "",
  eyebrow = "About the curator",
  paragraphs = [],
  signature,
  signatureAlt = "Signature",
  signatureAccent, // optional custom image, else default squiggle
}) {
  return (
    <section className="about-curator" aria-label="About the curator">
      <style>{css}</style>

      <div className="about-curator__media">
        <img className="about-curator__image" src={image} alt={imageAlt} />
      </div>

      <div className="about-curator__content">
        <p className="about-curator__eyebrow">{eyebrow}</p>

        <div className="about-curator__body">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="about-curator__sign">
          <img
            className="about-curator__sign-image"
            src={signature}
            alt={signatureAlt}
          />
          {signatureAccent ? (
            <img
              className="about-curator__sign-accent"
              src={signatureAccent}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <DefaultSignatureAccent />
          )}
        </div>
      </div>
    </section>
  );
}