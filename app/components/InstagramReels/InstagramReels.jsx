import {useState} from 'react';
import {ChevronLeft, ChevronRight, ExternalLink} from 'lucide-react';

export function InstagramReels({
  reels = [],
  instagramHandle = '@NIMIE.IN',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!reels.length) {
    return null;
  }

  const visibleReels = [
    reels[currentIndex],
    reels[(currentIndex + 1) % reels.length],
  ];

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? reels.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((current) => (current + 1) % reels.length);
  };

  return (
    <section className="px-5 py-8">
      <div className="rounded-xl bg-[#fff8e9] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1.35fr_1.35fr]">

          {/* Left content */}
          <div className="flex min-h-[420px] flex-col justify-between p-2 sm:p-4 md:col-span-2 lg:col-span-1">
            <div>
              <p className="text-[13px] font-medium tracking-wide text-[#315329]">
                {instagramHandle} + YOU
              </p>

              <h2 className="mt-3 text-[28px] leading-[1.1] text-[#315329] sm:text-[30px]">
                Follow us on
                <span className="block text-[38px] font-bold sm:text-[40px]">
                  Instagram
                </span>
              </h2>
            </div>

            <div>
              <p className="max-w-[260px] text-[11px] leading-[1.5] text-[#315329]">
                A craft passed from one generation to the next.Hands that
                remember what books cannot teach. Threads that follow the
                rhythm of the needle. Every stitch taking its own time.
                Thus, bringing each piece quietly to life.
              </p>

              {/* Navigation for large screens */}
              <div className="mt-5 hidden gap-2 lg:flex">
                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="Previous Instagram reel"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#315329] transition hover:bg-[#315329] hover:text-white"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Instagram reel"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#315329] transition hover:bg-[#315329] hover:text-white"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Reels */}
          {visibleReels.map((reel, index) => (
            <a
              key={`${reel.id}-${currentIndex}-${index}`}
              href={reel.permalink}
              target="_blank"
              rel="noreferrer"
              className={`group relative block aspect-[9/14] overflow-hidden rounded-lg bg-stone-200 ${
                index === 1 ? 'hidden md:block' : ''
              }`}
            >
              {/* Reel video */}
              {reel.media_type === 'VIDEO' && reel.media_url ? (
                <video
                  src={reel.media_url}
                  poster={reel.thumbnail_url}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <img
                  src={reel.thumbnail_url || reel.media_url}
                  alt={reel.caption || 'Nimie Instagram Reel'}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}

              {/* Instagram handle */}
              <div className="absolute left-3 top-3 text-[9px] font-medium text-white drop-shadow-md">
                {instagramHandle}
              </div>

              {/* Open Instagram */}
              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <ExternalLink size={12} />
              </div>

              {/* Caption */}
              {reel.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 pt-12">
                  <p className="line-clamp-2 text-[12px] leading-4 text-white">
                    {reel.caption}
                  </p>
                </div>
              )}
            </a>
          ))}

          {/* Navigation for medium and small screens */}
          <div className="flex gap-2 px-2 sm:px-4 md:col-span-2 lg:hidden">
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous Instagram reel"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#315329] transition hover:bg-[#315329] hover:text-white"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Instagram reel"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#315329] transition hover:bg-[#315329] hover:text-white"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}