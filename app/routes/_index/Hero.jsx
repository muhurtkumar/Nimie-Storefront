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
    </section>
  );
}