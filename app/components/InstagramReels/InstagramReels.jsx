import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, ExternalLink} from 'lucide-react';

export function InstagramReels({reels = [], instagramHandle = '@nimie.in'}) {
  const visibleReels = reels.slice(0, 6);
  const trackRef = useRef(null);
  const [activeVideoKey, setActiveVideoKey] = useState(null);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    if (!('IntersectionObserver' in window)) {
      setActiveVideoKey(track.querySelector('[data-reel-key]')?.dataset.reelKey ?? null);
      return;
    }

    const visibility = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(
            entry.target.dataset.reelKey,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let bestKey = null;
        let bestRatio = 0.3;

        for (const [key, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestKey = key;
            bestRatio = ratio;
          }
        }

        setActiveVideoKey(bestKey);
      },
      {threshold: [0, 0.3, 0.6, 1]},
    );

    track.querySelectorAll('[data-reel-key]').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [visibleReels.length]);

  if (!visibleReels.length) {
    return null;
  }
  
  const profileUrl = `https://www.instagram.com/${instagramHandle.replace('@', '')}/`;

  return (
    <section className="px-4 py-5">
      <div className="rounded-xl bg-[#fff8e9] p-3">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-[1fr_1.35fr_1.35fr]">
          {/* Left content */}
          <div className="flex min-h-0 flex-col justify-start p-2 sm:p-3 md:col-span-2 lg:min-h-[340px] lg:justify-between lg:col-span-1">
            <div>
              <p className="text-[13px] font-medium tracking-wide text-[#315329]">
                {instagramHandle} + you
              </p>

              <h2
                className="text-[26px] leading-[1.1] text-[#315329] sm:text-[28px]"
                style={{marginTop: '4px'}}
              >
                Follow us on
                <span className="block text-[36px] font-bold sm:text-[38px]">
                  Instagram
                </span>
              </h2>
            </div>

            <div className="mt-0 lg:mt-0">
              <p className="max-w-[1500px] text-[13px] leading-[1.35] text-[#315329] lg:text-[10px] lg:leading-[1.5]">
                A craft passed from one generation to the next.
                <br />
                Hands that remember what books cannot teach.
                <br />
                Threads that follow the rhythm of the needle.
                <br />
                Every stitch taking its own time. Thus, bringing each piece
                quietly to life.
              </p>

              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                style={{color: '#FFFFFF'}}
                className="group mt-4 inline-flex items-center gap-2 rounded-full bg-[#315329] px-5 py-2.5 text-[13px] font-medium no-underline transition-colors duration-300 hover:bg-[#264220]"
              >
                Check Out Page
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>

          {/* Reels marquee */}
          <div className="min-w-0 overflow-hidden md:col-span-2">
            <div className="instagram-marquee">
              <div className="instagram-marquee__track" ref={trackRef}>
                {[
                  ...visibleReels.map((reel) => ({...reel, copy: 'first'})),
                  ...visibleReels.map((reel) => ({...reel, copy: 'second'})),
                ].map((reel) => (
                  <div
                    key={`${reel.id}-${reel.copy}`}
                    data-reel-key={`${reel.id}-${reel.copy}`}
                    className="w-[calc(50vw-24px)] flex-none pr-2.5 sm:w-[240px] lg:w-[260px]"
                  >
                    <a
                      href={reel.permalink}
                      target="_blank"
                      rel="noreferrer"
                      aria-hidden={reel.copy === 'second' || undefined}
                      tabIndex={reel.copy === 'second' ? -1 : undefined}
                      className="group relative block aspect-[9/16] overflow-hidden rounded-lg bg-stone-200"
                    >
                      {reel.media_url ? (
                        <VisibleReelVideo
                          src={reel.media_url}
                          poster={reel.thumbnail_url}
                          isActive={activeVideoKey === `${reel.id}-${reel.copy}`}
                        />
                      ) : reel.thumbnail_url ? (
                        <img
                          src={reel.thumbnail_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}

                      <div className="absolute left-3 top-3 text-[9px] font-medium text-white drop-shadow-md">
                        {instagramHandle}
                      </div>

                      <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                        <ExternalLink size={12} />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisibleReelVideo({src, poster, isActive}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={isActive ? src : undefined}
      poster={poster || undefined}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
    />
  );
}
