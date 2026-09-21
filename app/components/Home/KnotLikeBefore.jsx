import React from 'react';

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
    <section
      className="w-full bg-white px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      aria-labelledby="knot-like-before-heading"
    >
      <div
        className="
          mx-auto grid w-full max-w-[1200px]
          grid-cols-1 items-center gap-8
          md:grid-cols-2 md:gap-10
          lg:gap-[70px]
        "
      >
        {/* Image */}
        <div className="w-full overflow-hidden rounded-[5px]">
          <img
            src={image}
            alt={imageAlt}
            className="block h-auto w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative w-full">
          {/* Small Label */}
          <p
            className="
              mb-2
              text-[9px] font-medium uppercase
              tracking-[0.08em] text-[#555]
              sm:text-[10px]
            "
          >
            {eyebrow}
          </p>

          {/* Main Heading */}
          <h2
            id="knot-like-before-heading"
            className="
              mb-5
              text-[42px] font-normal leading-[0.92]
              tracking-[-0.04em] text-[#A83B96]
              sm:text-[48px]
              md:text-[44px]
              lg:text-[58px]
              xl:text-[64px]
            "
          >
            {heading}
          </h2>

          {/* Intro Title */}
          <h3
            className="
              mb-2
              text-[13px] font-bold leading-[1.4]
              text-[#171717]
              sm:text-[14px]
            "
          >
            {introTitle}
          </h3>

          {/* Description */}
          <p
            className="
              max-w-[560px]
              text-[12px] font-normal leading-[1.65]
              text-[#252525]
              sm:text-[13px]
            "
          >
            {description}
          </p>

          {/* Promises */}
          {points?.length > 0 && (
            <ul
              className="
                mt-4 max-w-[560px]
                list-disc space-y-1.5 pl-[18px]
                text-[12px] leading-[1.55]
                text-[#252525]
                sm:text-[13px]
              "
            >
              {points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}

          {/* Decorative mark */}
          <div
            className="
              mt-5 ml-auto flex h-[45px] w-[45px]
              rotate-[-15deg]
              items-center justify-center
              text-[34px] font-light
              text-[#A83B96]
            "
            aria-hidden="true"
          >
            ♡
          </div>
        </div>
      </div>
    </section>
  );
}