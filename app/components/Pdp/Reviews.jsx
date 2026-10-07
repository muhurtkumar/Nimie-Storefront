import React, {useMemo} from "react";
import stickerPug from "~/assets/Stickers/Lion.jfif";
import stickerFrog from "~/assets/Stickers/Monkey.jfif";
import stickerCow from "~/assets/Stickers/Cow.jfif";
import stickerElephant from "~/assets/Stickers/Elephant.jfif";
import stickerAlpaca from "~/assets/Stickers/Dear.jfif";
import stickerFlamingo from "~/assets/Stickers/Penguin.jfif";

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Your 6 sticker files, imported so Vite resolves and bundles them properly.
const STICKERS = [
  stickerPug,
  stickerFrog,
  stickerCow,
  stickerElephant,
  stickerAlpaca,
  stickerFlamingo,
];

// Randomly assigns one sticker per card, guaranteeing no two consecutive
// cards share a sticker — including the wrap point where the marquee
// loops back to the start, so the seam never shows a repeat either.
function assignNonRepeatingStickers(count, stickers) {
  if (count === 0) return [];
  const result = [];
  let lastIndex = -1;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    let idx;
    let attempts = 0;

    do {
      idx = Math.floor(Math.random() * stickers.length);
      attempts++;
      // isLast also avoids matching result[0], so the loop seam is clean.
    } while (
      stickers.length > 1 &&
      attempts < 20 &&
      (idx === lastIndex || (isLast && idx === result[0]))
    );

    result.push(idx);
    lastIndex = idx;
  }

  return result.map((idx) => stickers[idx]);
}

const css = `
.reviews {
  width: 100%;
  font-family: ${FONT};
  background: #FFF7E7;
  padding: clamp(40px, 6vw, 72px) 0;
}

.reviews *,
.reviews *::before,
.reviews *::after {
  box-sizing: border-box;
}

.reviews__title {
  margin: 0 0 clamp(24px, 4vw, 40px);
  text-align: center;

  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;

  color: #2F5723;
}

/* =========================================
   MARQUEE
   ========================================= */

.reviews__strips {
  padding: clamp(20px, 3vw, 32px) 0;
}

.reviews__strip {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.reviews__track {
  display: flex;
  width: max-content;
  gap: clamp(16px, 2vw, 24px);
  padding: 0 clamp(16px, 2vw, 24px);

  animation: reviews-marquee 45s linear infinite;
  will-change: transform;
}

.reviews__track--paused {
  animation-play-state: paused;
}

.reviews__track--reverse {
  animation-direction: reverse;
}

/* Third row: slightly different speed so rows don't move in lockstep */
.reviews__track--slow {
  animation-duration: 55s;
}

/* Gap between rows */
.reviews__strip + .reviews__strip {
  margin-top: clamp(12px, 1.5vw, 20px);
}

/* Third row is only shown on mobile */
.reviews__strip--mobile-only {
  display: none;
}

@keyframes reviews-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .reviews__track {
    animation: none;
  }
}

/* =========================================
   CARD
   ========================================= */

.reviews__card {
  flex-shrink: 0;
  width: clamp(260px, 28vw, 340px);

  background: transparent;
  border: 1px solid rgba(47, 87, 35, 0.25);
  border-radius: 12px;

  padding: clamp(18px, 2.2vw, 24px);
}

.reviews__card-header {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: clamp(10px, 1.5vw, 14px);
}

.reviews__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;

  object-fit: cover;
  background: #F8F1DF;
  flex-shrink: 0;
}

.reviews__meta {
  display: flex;
  flex-direction: column;
}

.reviews__name {
  font-size: 14px;
  font-weight: 700;
  color: #171717;
}

.reviews__date {
  font-size: 12px;
  font-weight: 400;
  color: rgba(23, 23, 23, 0.55);
}

.reviews__text {
  margin: 0;

  font-size: 13px;
  font-weight: 400;
  line-height: 1.55;

  color: rgba(23, 23, 23, 0.85);
}

@media (max-width: 767px) {
  .reviews__card {
    width: 260px;
  }

  .reviews__strip--mobile-only {
    display: block;
  }
}
`;

export function Reviews({reviews = [], title = "Reviews"}) {
  // One sticker per review per row, assigned randomly with no adjacent
  // repeats. useMemo keeps these stable across re-renders.
  const stickersRow1 = useMemo(
    () => assignNonRepeatingStickers(reviews.length, STICKERS),
    [reviews.length]
  );
  const stickersRow2 = useMemo(
    () => assignNonRepeatingStickers(reviews.length, STICKERS),
    [reviews.length]
  );
  const stickersRow3 = useMemo(
    () => assignNonRepeatingStickers(reviews.length, STICKERS),
    [reviews.length]
  );

  if (!reviews.length) return null;

  // Row 2 uses the reviews in reverse order; row 3 starts from the middle,
  // so the three rows never look like copies of each other.
  const mid = Math.floor(reviews.length / 2);
  const rows = [
    {
      key: "row1",
      items: reviews,
      stickers: stickersRow1,
      trackClass: "",
      stripClass: "",
    },
    {
      key: "row2",
      items: [...reviews].reverse(),
      stickers: stickersRow2,
      trackClass: "reviews__track--reverse",
      stripClass: "",
    },
    {
      key: "row3",
      items: [...reviews.slice(mid), ...reviews.slice(0, mid)],
      stickers: stickersRow3,
      trackClass: "reviews__track--slow",
      stripClass: "reviews__strip--mobile-only",
    },
  ];

  return (
    <section className="reviews" aria-label={title}>
      <style>{css}</style>

      <h2 className="reviews__title">{title}</h2>

      <div className="reviews__strips">
        {rows.map((row) => {
          // Duplicate both the reviews and their matching stickers so each
          // strip loops seamlessly without a sticker mismatch at the seam.
          const items = [...row.items, ...row.items];
          const stickers = [...row.stickers, ...row.stickers];

          return (
            <div
              key={row.key}
              className={`reviews__strip ${row.stripClass}`.trim()}
            >
              <div className={`reviews__track ${row.trackClass}`.trim()}>
                {items.map((review, index) => (
                  <article
                    key={`${row.key}-${review.id}-${index}`}
                    className="reviews__card"
                  >
                    <div className="reviews__card-header">
                      <img
                        className="reviews__avatar"
                        src={stickers[index]}
                        alt=""
                        aria-hidden="true"
                      />
                      <div className="reviews__meta">
                        <span className="reviews__name">{review.name}</span>
                        <span className="reviews__date">{review.date}</span>
                      </div>
                    </div>

                    <p className="reviews__text">{review.text}</p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}