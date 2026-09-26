import { ScalarLeafsRule } from 'graphql';
import {useState} from 'react';
import {Link} from 'react-router';

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Space between the page edge and the hero card. Keep in sync with Header.jsx
const GAP_Y = '16px'; // top and bottom
const GAP_X = '0px'; // left and right
// Text inset inside the card (Figma: 32px)
const INSET = 'clamp(16px, 2.5vw, 32px)';

export function Hero({image, imageAlt = '', eyebrow, heading, cta}) {
  return (
    <section
      className="hero"
      style={{
        padding: `${GAP_Y} ${GAP_X}`,
        margin: 0,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{borderRadius: 16}}
      >
        {image ? (
          // In normal flow: the image sets the card's height, so it is never cropped
          <img
            src={image}
            alt={imageAlt}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              minHeight: 520, // only kicks in on narrow phones
              objectFit: 'cover',
              borderRadius: 0,
            }}
          />
        ) : (
          <div className="bg-stone-300" style={{width: '100%', height: 520}} />
        )}

        {/* Figma overlay: gradient with the 50% opacity baked into the stops */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, rgba(17,23,13,0.5) 7.69%, rgba(207,208,207,0) 31.25%, rgba(17,23,13,0.45) 64.9%, rgba(17,23,13,0.5) 100%)',
          }}
        />

        {/* Bottom content row: text bottom-left, CTA bottom-right */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4"
          style={{padding: `0 ${INSET} ${INSET}`, fontFamily: FONT}}
        >
          <div style={{minWidth: 0}}>
            {eyebrow && (
              <p
                style={{
                  margin: '0 0 12px',
                  maxWidth: 320,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: '#fff',
                }}
              >
                {eyebrow}
              </p>
            )}

            <h1
              style={{
                margin: 0,
                maxWidth: 594,
                fontFamily: FONT,
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                fontWeight: 400,
                lineHeight: 1.22,
                letterSpacing: 0,
                color: '#fff',
              }}
            >
              {heading}
            </h1>
          </div>

          {cta && (
            <Link
              to={cta.to}
              style={{
                flex: '0 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 44,
                padding: '0 32px',
                borderRadius: 12,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 500,
                textTransform: 'uppercase',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                color: '#000',
                background: '#fff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
