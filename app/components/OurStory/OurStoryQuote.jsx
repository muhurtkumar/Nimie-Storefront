import React from "react";

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
/* =========================================================
   OUR STORY — QUOTE SECTION.
   ========================================================= */

.our-story-quote {
  position: relative;
  width: 100%;
  overflow: hidden;
  font-family: ${FONT};

  min-height: clamp(360px, 42vw, 560px);

  display: flex;
  align-items: center;
  justify-content: center;

  /* breathing room top/bottom, inside AND outside the section */
  padding-block: clamp(28px, 5vw, 56px);
  margin-block: clamp(24px, 4vw, 48px);
  box-sizing: border-box;
}

/* =========================================================
   BACKGROUND IMAGE.
   ========================================================= */

.our-story-quote__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}

/* =========================================================
   DARK OVERLAY.
   ========================================================= */

.our-story-quote__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

/* =========================================================
   QUOTE COMPOSITION
   ========================================================= */

/*
  The quote marks are positioned relative to the TEXT BLOCK
  itself (not the whole content box), so they hug the corners
  of whatever the text's actual rendered size turns out to be.
  Open sits at the upper-left, close at the lower-right —
  "bookending" the paragraph — while the paragraph stays
  centered in the component via the flex row below.

  Because the offsets use em/percentage units tied to the
  mark's own font-size (which itself is a clamp()), the amount
  they poke outside the text scales proportionally at every
  screen size instead of needing separate breakpoint values.

*/

.our-story-quote__content {
  position: relative;
  z-index: 2;
  width: 60%; /* 3/5 of the component  */
  max-width: 1100px;
  margin: 0 auto;
  color: #ffffff;

  display: flex;
  justify-content: center;
}

.our-story-quote__text-wrap {
  position: relative;
  width: 100%;
}

.our-story-quote__mark {
  position: absolute;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 700;
  line-height: 0.7;
  font-size: clamp(40px, 6vw, 90px);
  pointer-events: none;
  user-select: none;
}

/* upper-left, tucked slightly into the text block */

.our-story-quote__mark--open {
  top: 0;
  left: 0;
  transform: translate(-165%, -75%);
}

/* lower-right, hanging below the text block — the mark's
   ink sits near the TOP of its own line box (same as the
   opening mark), so it needs a bigger downward push than a
   simple mirror of the open mark's offset to actually clear
   the last line and sit below it. */

.our-story-quote__mark--close {
  bottom: 0;
  right: 0;
  transform: translate(165%, 135%);
}

/* =========================================================
   MAIN QUOTE TEXT
   ========================================================= */

.our-story-quote__text {
  margin: 0;
  color: #ffffff;
  text-align: center;
  font-size: clamp(22px, 2.8vw, 50px);
  font-weight: 400;
  line-height: 1.35;
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {
  .our-story-quote {
    min-height: clamp(380px, 55vw, 500px);
  }

  .our-story-quote__content {
    width: 84%;
    max-width: none;
  }

  .our-story-quote__text {
    font-size: clamp(21px, 3vw, 32px);
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 600px) {
  .our-story-quote {
    min-height: 400px;
    padding-block: clamp(20px, 8vw, 36px);
  }

  .our-story-quote__content {
    width: 90%;
    max-width: none;
  }

  .our-story-quote__text {
    font-size: 17px;
    line-height: 1.4;
  }

  .our-story-quote__mark {
    font-size: 44px;
  }

  .our-story-quote__mark--open {
    transform: translate(-70%, -60%);
  }

  .our-story-quote__mark--close {
    transform: translate(45%, 100%);
  }
}
`;

/* =========================================================
   COMPONENT
   ========================================================= */

export function OurStoryQuote({ image, imageAlt = "", quote }) {
  return (
    <section className="our-story-quote" aria-label="Our story quote">
      <style>{css}</style>

      {/* Background image */}
      <img className="our-story-quote__image" src={image} alt={imageAlt} />

      {/* Dark overlay */}
      <div className="our-story-quote__overlay" aria-hidden="true" />

      {/* Quote composition */}
      <div className="our-story-quote__content">
        <div className="our-story-quote__text-wrap">
          <span
            className="our-story-quote__mark our-story-quote__mark--open"
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <p className="our-story-quote__text">{quote}</p>

          <span
            className="our-story-quote__mark our-story-quote__mark--close"
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </div>
      </div>
    </section>
  );
}

// this is our story quote.