import React from 'react';

// Same stack as Header.jsx so the type matches the rest of the site
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Keep in sync with the side gap used by Hero / product grid (~16px)
const SIDE_GAP = '16px';

/**
 * Plain (un-layered) class selectors so app.css element rules
 * (h2, ul, img, p ...) can never override them.
 *
 * LAYOUT
 * ------
 * < 768px  (mobile)   1 column, in this order:
 *                     eyebrow + heading  ->  picture  ->  text  ->  smile
 * >= 768px (tablet/desktop)  2 columns:
 *                     picture (left) spans 3 rows
 *                     right: heading (top) / text (middle) / smile (bottom)
 *                     so the right side always starts and ends exactly
 *                     where the picture starts and ends.
 *
 * The picture fills its grid cell (object-fit: cover). It is at least
 * square, but if the text is taller (tablet) the picture grows to match
 * the text height instead of leaving a gap.
 */
const css = `
.klb {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  font-family: ${FONT};
  padding: clamp(28px, 5vw, 96px) ${SIDE_GAP};
}
.klb *, .klb *::before, .klb *::after { box-sizing: border-box; }

/* ================= MOBILE (default) ================= */
.klb__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 24px;
  width: 100%;
  max-width: none;
  margin: 0;
}

/* --- heading group --- */
.klb__head { min-width: 0; }
.klb__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #303030;
}
.klb__heading {
  margin: 0;
  font-size: inherit;
  font-weight: 400;
  line-height: 1;
}
.klb__svg {
  display: block;
  width: 100%;
  max-width: 520px;
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

/* --- picture --- */
.klb__media {
  position: relative;
  min-width: 0;
  width: 100%;
}
/* spacer: keeps the picture at least square (but never taller than 90vh) */
.klb__media::before {
  content: '';
  display: block;
  padding-top: min(100%, 90vh);
}
.klb__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid rgba(168, 59, 150, 0.12);
  box-shadow: 0 10px 70px 6px rgba(214, 120, 190, 0.22);
}

/* --- text --- */
.klb__body { min-width: 0; }
.klb__intro {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #111;
}
.klb__desc {
  margin: 0;
  max-width: none;
  font-size: 17px;
  font-weight: 350;
  line-height: 2;
  color: #171717;
}
.klb__list {
  margin: 16px 0 0;
  padding: 0 0 0 2em;
  list-style: disc outside;
  font-size: 15px;
  line-height: 1.45;
  color: #171717;
}
.klb__list li {
  display: list-item;
  list-style: disc outside;
  margin: 0 0 4px;
  padding-left: 0.2em;
}

/* --- smile --- */
.klb__smile {
  display: flex;
  justify-content: flex-end;
  padding-right: 5%;
}
.klb__smile svg {
  display: block;
  width: 64px;
  height: auto;
}

/* ================= TABLET + DESKTOP (>= 768px) ================= */
@media (min-width: 768px) {
  .klb__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto auto 1fr;   /* was: auto 1fr auto */
    column-gap: clamp(24px, 4vw, 96px);
    row-gap: 0;
  }

  .klb__media { grid-column: 1; grid-row: 1 / span 3; }

  .klb__head  { grid-column: 2; grid-row: 1; align-self: start; }
  .klb__body  { grid-column: 2; grid-row: 2; align-self: start;
                padding-top: clamp(20px, 3vw, 40px); }   /* was: align-self:center; padding-block: ... */
  .klb__smile { grid-column: 2; grid-row: 3; align-self: end; }

  .klb__head,
  .klb__body { padding-right: clamp(0px, 3vw, 72px); }
  .klb__smile { padding-right: clamp(0px, 3vw, 72px); }   /* was: calc(clamp(0px, 3vw, 72px) + 5%) */

  /* fluid type: ~13px at 768px, ~19-20px on very large screens */
.klb__eyebrow { font-size: clamp(10px, calc(7px + 0.3vw), 13px); margin-bottom: clamp(20px, 3vw, 40px); }
  .klb__intro   { font-size: clamp(14px, calc(9px + 0.6vw), 21px); }
  .klb__desc,
  .klb__list    { font-size: clamp(13px, calc(8px + 0.6vw), 20px); }
  .klb__list    { margin-top: clamp(12px, 1.6vw, 28px); }

  .klb__svg { max-width: none; }
  .klb__smile svg { width: clamp(48px, 5.5vw, 104px); }
}
`;

/**
 * Props
 * - image, imageAlt
 * - eyebrow      "A note from the designer"
 * - heading      "Knot like Before"  (plain string, drawn on a curve)
 * - introTitle   "For The Love Of Where We Come From."
 * - description  string OR JSX
 * - points       array of string OR JSX
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
        {/* 1. PICTURE (first on mobile, left column on desktop) */}
        <div className="klb__media">
          <img className="klb__img" src={image} alt={imageAlt} />
        </div>

        {/* 2. EYEBROW + HEADING (second on mobile, top-right on desktop) */}
        <div className="klb__head">
          <p className="klb__eyebrow">{eyebrow}</p>

          <h2 id="knot-like-before-heading" className="klb__heading">
            <span className="klb__sr">{heading}</span>
            <svg
              className="klb__svg"
              viewBox="0 15 900 150"
              aria-hidden="true"
              focusable="false"
            >
              <path id="klb-wave" d="M 8 125 C 180 148, 320 145, 420 100 C 520 65, 600 55, 680 65 C 730 72, 760 85, 900 160" fill="none" />
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
        </div>

        {/* 3. TEXT (third on mobile, middle-right on desktop) */}
        <div className="klb__body">
          <h3 className="klb__intro">{introTitle}</h3>
          <p className="klb__desc">{description}</p>

          {points?.length > 0 && (
            <ul className="klb__list">
              {points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}
        </div>

        {/* 4. SMILE (last on mobile, bottom-right on desktop) */}
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
    </section>
  );
}