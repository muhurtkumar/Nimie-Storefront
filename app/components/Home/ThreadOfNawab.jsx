import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Space between the page edge and the card. Keep in sync with Header.jsx / Hero.jsx
const GAP_Y = '16px';
const GAP_X = '0px';
// Text inset inside the card (matches Hero.jsx)
const INSET = 'clamp(16px, 2.5vw, 32px)';
// Gold used for the heading + logo mark in the Figma file
const GOLD = '#F4D9A0';
// Crossfade between clips, in ms
const FADE_MS = 500;

export function ThreadOfNawab({
  image,
  imageAlt = '',
  videos,
  logo,
  logoAlt = '',
  eyebrow,
  heading,
  description,
  to,
}) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? {to, prefetch: 'intent'} : {};

  return (
    <section
      style={{padding: `${GAP_Y} ${GAP_X}`, margin: 0, boxSizing: 'border-box', width: '100%'}}
    >
      <Wrapper
        {...wrapperProps}
        className="relative block w-full overflow-hidden"
        style={{borderRadius: 16, textDecoration: 'none', lineHeight: 0}}
      >
        {videos && videos.length > 0 ? (
          <VideoCarousel sources={videos} />
        ) : image ? (
          <img
            src={image}
            alt={imageAlt}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              minHeight: 520,
              objectFit: 'cover',
              borderRadius: 0,
            }}
          />
        ) : (
          <div className="bg-stone-300" style={{width: '100%', height: 520}} />
        )}

        {/* Same gradient recipe as Hero.jsx, kept dark top+bottom, light middle */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, rgba(17,23,13,0.55) 7.69%, rgba(207,208,207,0) 31.25%, rgba(17,23,13,0.45) 64.9%, rgba(17,23,13,0.55) 100%)',
          }}
        />

        {/* Content: eyebrow + heading pinned top, logo + copy pinned bottom */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-between"
          style={{padding: INSET, fontFamily: FONT}}
        >
          <div>
            {eyebrow && (
              <p
                style={{
                  margin: 0,
                  maxWidth: 320,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: GOLD,
                }}
              >
                {eyebrow}
              </p>
            )}

            <h2
              style={{
                margin: '8px 0 0',
                maxWidth: 720,
                fontFamily: FONT,
                fontSize: 'clamp(40px, 6.2vw, 88px)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: 0,
                color: GOLD,
                // Belt-and-suspenders: if a global rule (e.g. a `h2 { color }`
                // reset like the `a { color }` one noted in Header.jsx) is
                // still winning on your site, this forces it back to gold.
                WebkitTextFillColor: GOLD,
              }}
            >
              {heading}
            </h2>
          </div>

          <div style={{maxWidth: 360}}>
            {logo && (
              <img
                src={logo}
                alt={logoAlt}
                style={{
                  display: 'block',
                  height: 'clamp(52px, 6vw, 76px)',
                  width: 'auto',
                  marginBottom: 16,
                }}
              />
            )}

            {description && (
              <p
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: GOLD,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </Wrapper>
    </section>
  );
}

/**
 * Plays `sources` in order, one at a time. Each clip plays once through;
 * when it ends, the next clip crossfades in. After the last clip it loops
 * back to the first. The next clip is preloaded while the current one plays,
 * so there's no loading gap at the cut.
 */
function VideoCarousel({sources}) {
  const [active, setActive] = useState(0);
  const videoRefs = useRef([]);

  const goToNext = () => setActive((i) => (i + 1) % sources.length);

  // Autoplay can be blocked until the tab is visible/focused in some
  // browsers; nudge playback whenever the active clip changes.
  useEffect(() => {
    const el = videoRefs.current[active];
    if (el) {
      el.currentTime = 0;
      const playPromise = el.play();
      if (playPromise) playPromise.catch(() => {});
    }
  }, [active]);

  return (
    <div style={{position: 'relative', width: '100%', minHeight: 520}}>
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => (videoRefs.current[i] = el)}
          src={src}
          muted
          playsInline
          preload={Math.abs(i - active) <= 1 ? 'auto' : 'none'}
          onEnded={i === active ? goToNext : undefined}
          style={{
            display: 'block',
            position: i === active ? 'relative' : 'absolute',
            inset: 0,
            width: '100%',
            height: i === active ? 'auto' : '100%',
            minHeight: 520,
            objectFit: 'cover',
            borderRadius: 0,
            opacity: i === active ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}