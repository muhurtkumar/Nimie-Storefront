import {ExternalLink} from 'lucide-react';

export function InstagramReels({
  reels = [],
  instagramHandle = '@nimie.in',
}) {
  if (!reels.length) {
    return null;
  }

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
                Every stitch taking its own time. Thus, bringing each piece quietly to life.
              </p>
            </div>
          </div>

          {/* Reels marquee */}
          <div className="min-w-0 overflow-hidden md:col-span-2">
            <div className="instagram-marquee">
              <div className="instagram-marquee__track">
                {[...reels, ...reels].map((reel, index) => (
                  <div
                    key={`${reel.id}-${index}`}
                    className="w-[calc(50vw-24px)] flex-none pr-2.5 sm:w-[240px] lg:w-[260px]"
                  >
                    <a
                      href={reel.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-[9/16] overflow-hidden rounded-lg bg-stone-200"
                    >
                      {reel.media_type === 'VIDEO' && reel.media_url && (                       
                        <video
                          src={reel.media_url}
                          poster={reel.thumbnail_url}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      )}

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