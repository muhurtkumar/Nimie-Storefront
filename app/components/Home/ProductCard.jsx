import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

const colorMap = {
  green: '#8fa33f',
  blue: '#4f9da6',
  cream: '#d9d5a5',
  beige: '#d8c99a',
  white: '#e8e4d0',
  black: '#252b22',
  brown: '#756044',
  pink: '#d7a5a5',
};

function getColor(value) {
  return colorMap[value.toLowerCase()] || '#c8c8b0';
}

export function ProductCard({product, index}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);

  const images = product.images?.nodes ?? [];

  const colorOption = product.options?.find(
    (option) => option.name.toLowerCase() === 'color',
  );

  const colors = colorOption?.optionValues?.slice(0, 3) || [];

  const badge = product.tags?.[0];

  /*
   * Automatically move to the next image while hovering.
   */
  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveImageIndex((currentIndex) => currentIndex + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setDisableTransition(false);
    setActiveImageIndex(0);
  };

  /*
   * When we reach the duplicated first image,
   * instantly reset to the real first image.
   *
   * Visually there is no jump because both images
   * are exactly the same.
   */
  const handleTransitionEnd = () => {
    if (images.length > 1 && activeImageIndex === images.length) {
      setDisableTransition(true);
      setActiveImageIndex(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisableTransition(false);
        });
      });
    }
  };

  /*
   * Duplicate the images once.
   *
   * Example:
   * [1, 2, 3, 4, 1, 2, 3, 4]
   */
  const sliderImages =
    images.length > 1
      ? [...images, ...images]
      : images;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-lg bg-[#f8f1df]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
        {sliderImages.length > 0 ? (
          <div
            className={`absolute inset-0 h-full w-full ${
              disableTransition
                ? ''
                : 'transition-transform duration-700 ease-in-out'
            }`}
            style={{
              transform: `translateY(-${activeImageIndex * 100}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {sliderImages.map((image, imageIndex) => (
              <div
                key={`${image.id}-${imageIndex}`}
                className="h-full w-full"
              >
                <Image
                  data={image}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          product.featuredImage && (
            <Image
              data={product.featuredImage}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="h-full w-full object-cover"
            />
          )
        )}

        {/* Product badge */}
        {badge && (
          <div className="absolute left-3 top-3 flex items-center gap-1 text-[10px] uppercase tracking-wide text-white">
            <span className="text-yellow-300">▲</span>
            {badge}
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-1">
            {colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-5 w-5 rounded border border-white/70"
                style={{
                  backgroundColor: getColor(color.name),
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label={`View ${product.title}`}
            className="flex h-7 w-7 items-center justify-center rounded bg-white text-xs shadow-sm"
          >
            ♧
          </button>
        </div>
      </div>

      <div className="px-3 py-3">
        <h3 className="text-[13px] font-semibold leading-4 text-stone-800">
          {product.title}
        </h3>

        <p className="mt-1 text-[10px] text-stone-600">
          {product.productType}
        </p>
      </div>
    </Link>
  );
}