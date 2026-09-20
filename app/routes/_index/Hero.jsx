<<<<<<< HEAD
import {useState} from 'react';
import {Link} from 'react-router';

const FONT = "'Roboto', sans-serif";
// Space between the page edge and the hero card. Keep in sync with Header.jsx
const GAP_Y = '16px'; // top and bottom
const GAP_X = '0px'; // left and right
// Text inset inside the card (Figma: 32px)
const INSET = 'clamp(16px, 2.5vw, 32px)';

export function Hero({image, imageAlt = '', eyebrow, heading, cta}) {
  const [hover, setHover] = useState(false);

  return (
    <section className="hero" style={{padding: `${GAP_Y} ${GAP_X}`, margin: 0, boxSizing: 'border-box', width: '100%'}}>
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

        {/* Bottom-left content */}
        <div
          className="absolute inset-x-0 bottom-0 z-10"
          style={{padding: `0 ${INSET} ${INSET}`, fontFamily: FONT}}
        >
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

          {cta && (
            <Link
              to={cta.to}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                marginTop: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                padding: '0 32px',
                border: '1px solid #fff',
                borderRadius: 9999,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 400,
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: hover ? '#000' : '#fff',
                background: hover ? '#fff' : 'transparent',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
=======
import {Link} from 'react-router';
export function Hero({image, imageAlt = '', eyebrow, heading, cta}) {
  return (
    <section className="relative flex h-[85vh] min-h-[520px] w-full items-end overflow-hidden sm:h-[90vh]">
      {image ? (
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400" />
      )}

      {/* Scrim so the heading stays readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

     <div className="relative z-10 w-full px-6 pb-8 sm:px-10 sm:pb-10">
  {eyebrow && (
    <p className="mb-3 text-sm font-medium text-white sm:text-base">
      {eyebrow}
    </p>
  )}

  <h1 className="max-w-[800px] text-6xl font-normal leading-[0.9] tracking-tight text-white sm:text-8xl lg:text-[100px]">
    {heading}
  </h1>

  {cta && (
    <Link
      to={cta.to}
      className="mt-4 inline-block rounded-full border border-white px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-white hover:text-black sm:px-10 sm:py-3.5"
    >
      {cta.label}
    </Link>
  )}
</div>
>>>>>>> 08fde56 (Add Hero component and hero banner image for homepage)
    </section>
  );
}