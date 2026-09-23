import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Heart, ShoppingCart} from 'lucide-react';

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

function formatPrice(amount, currencyCode) {
  if (!amount) {
    return '';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Number(amount))
    .replace(/\s/g, '');
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

  const currentPrice = product.priceRange?.minVariantPrice;

  const originalPriceAmount = Number(currentPrice?.amount || 0);

  const discountPercentage = Math.min(
    Math.max(
      Number(product.discountPercentage?.value || 0),
      0,
    ),
    100,
  );

  const hasDiscount =
    discountPercentage > 0 && originalPriceAmount > 0;

  const discountedPriceAmount = hasDiscount
    ? Math.round(
        originalPriceAmount *
          (1 - discountPercentage / 100),
      )
    : originalPriceAmount;

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
      <div className="relative aspect-[4/4.5] overflow-hidden bg-stone-200">
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

        {/* Product tag */}
        {badge && (
          <div className="absolute left-3 top-3 rounded-full bg-[#345225] px-4 py-2 text-[16px] font-semibold uppercase text-[#FFDF9E]">
            {badge}
          </div>
        )}

        {/* Heart icon */}
        <Heart
          className="absolute right-4 top-4 h-8 w-8 text-[#FFDF9E]"
          strokeWidth={1.8}
        />

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
            <ShoppingCart className="h-4 w-4 text-[#345225]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="h-[78px] px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold leading-4 text-[#345225]">
              {product.title}
            </h3>

            <div className="mt-3 text-[13px] text-stone-600">
              {product.productType}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-3">
              {hasDiscount && (
                <span className="text-[13px] font-bold text-[#345225]">
                  {discountPercentage}% OFF
                </span>
              )}

              <span className="text-[20px] font-bold leading-5 text-black">
                {formatPrice(
                  discountedPriceAmount,
                  currentPrice?.currencyCode,
                )}
              </span>
            </div>

            {hasDiscount && (
              <div className="mt-3 text-[14px] text-[#e98b8b] line-through">
                {formatPrice(
                  originalPriceAmount,
                  currentPrice?.currencyCode,
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}