import React from 'react';

// Same stack as Header.jsx so the type matches the rest of the site
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Keep in sync with the side gap used by Hero / product grid (~16px)
const SIDE_GAP = '16px';

/**
 * WHY THIS IS WRITTEN WITH A <style> BLOCK (and not Tailwind classes)
 * -------------------------------------------------------------------
 * Your Header.jsx already noted that global rules in app.css beat Tailwind
 * utilities. Tailwind v4 puts utilities inside a CSS layer, and un-layered
 * CSS (h2 { font-size }, ul { list-style: none }, img { max-width: 100% }, p { margin })
 * always wins over layered CSS. That is why your heading was tiny, the bullets
 * disappeared and the layout looked boxed-in.
 *
 * Plain class selectors below are un-layered, and a class (0,1,0) beats an
 * element selector (0,0,1), so these styles always apply.
 */
const css = `
.klb {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  font-family: ${FONT};
  padding: clamp(32px, 5vw, 96px) ${SIDE_GAP};
}
.klb *, .klb *::before, .klb *::after { box-sizing: border-box; }

/* ---------- layout ---------- */
.klb__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
  align-items: center;
  width: 100%;
  max-width: none;
  margin: 0;
}
@media (min-width: 768px) {
  .klb__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(32px, 5vw, 96px);
  }
}

/* ---------- image ---------- */
.klb__img {
  display: block;
  width: 100%;
  max-width: none;
  height: auto;
  aspect-ratio: 1 / 1;
  max-height: 90vh;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid rgba(168, 59, 150, 0.12);
  /* soft pink glow like the design */
  box-shadow: 0 10px 70px 6px rgba(214, 120, 190, 0.22);
}

/* ---------- content ---------- */
.klb__content {
  min-width: 0;
  padding-right: clamp(0px, 4vw, 80px);
}
.klb__eyebrow {
  margin: 0 0 8px;
  font-size: clamp(10px, 0.85vw, 13px);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #303030;
}
.klb__heading {
  margin: 0 0 clamp(16px, 2vw, 32px);
  font-size: inherit;
  font-weight: 400;
  line-height: 1;
}
.klb__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.klb__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.klb__intro {
  margin: 0 0 8px;
  font-size: clamp(15px, 1.3vw, 21px);
  font-weight: 700;
  line-height: 1.4;
  color: #111;
}
.klb__desc {
  margin: 0;
  max-width: none;
  font-size: clamp(14px, 1.2vw, 20px);
  font-weight: 400;
  line-height: 1.5;
  color: #171717;
}
.klb__list {
  margin: clamp(16px, 1.6vw, 28px) 0 0;
  padding: 0 0 0 1.3em;
  list-style: disc outside;
  font-size: clamp(14px, 1.2vw, 20px);
  line-height: 1.45;
  color: #171717;
}
.klb__list li {
  display: list-item;
  list-style: disc outside;
  margin: 0 0 4px;
  padding-left: 0.2em;
}

/* ---------- smile mark ---------- */
.klb__smile {
  display: flex;
  justify-content: flex-end;
  margin-top: clamp(20px, 3vw, 48px);
  padding-right: 5%;
}
.klb__smile svg {
  display: block;
  width: clamp(56px, 5.5vw, 104px);
  height: auto;
}
`;

/**
 * Props
 * - image, imageAlt
 * - eyebrow      "A note from the designer"
 * - heading      "Knot like Before"  (plain string, drawn on a curve)
 * - introTitle   "For The Love Of Where We Come From."
 * - description  string OR JSX  (JSX lets you bold लखनऊ)
 * - points       array of string OR JSX (JSX lets you italicise "intention")
 */
export function KnotLikeBefore({
  image,
  imageAlt,
  eyebrow,
  heading,
  introTitle,
  description,
  points,
}) {
  return (
    <section className="klb" aria-labelledby="knot-like-before-heading">
      <style>{css}</style>

      <div className="klb__grid">
        {/* IMAGE */}
        <div style={{minWidth: 0}}>
          <img className="klb__img" src={image} alt={imageAlt} />
        </div>

        {/* CONTENT */}
        <div className="klb__content">
          <p className="klb__eyebrow">{eyebrow}</p>

          {/* Heading: real text for screen readers + curved SVG for the eye */}
          <h2 id="knot-like-before-heading" className="klb__heading">
            <span className="klb__sr">{heading}</span>
            <svg
              className="klb__svg"
              viewBox="0 0 800 150"
              aria-hidden="true"
              focusable="false"
            >
              {/* gentle arch: low on the left, rises in the middle, dips at the end */}
              <path id="klb-wave" d="M 8 120 Q 400 30 792 130" fill="none" />
              <text
                fill="#A83B96"
                style={{
                  fontFamily: FONT,
                  fontSize: 92,
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                }}
              >
                <textPath href="#klb-wave" startOffset="0">
                  {heading}
                </textPath>
              </text>
            </svg>
          </h2>

          <h3 className="klb__intro">{introTitle}</h3>

          <p className="klb__desc">{description}</p>

          {points?.length > 0 && (
            <ul className="klb__list">
              {points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}

          <div className="klb__smile" aria-hidden="true">
            <svg
              viewBox="0 0 100 85"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 31C27 20 26 12 30 8C34 5 38 11 41 25"
                stroke="#A83B96"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M48 27C47 16 48 9 52 7C57 6 61 15 63 27"
                stroke="#A83B96"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M18 37C23 56 39 67 56 65C73 63 84 51 86 34"
                stroke="#A83B96"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}