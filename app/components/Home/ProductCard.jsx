import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Heart, ShoppingCart} from 'lucide-react';

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

  /*
   * Get the first color gallery's color ID directly from
   * the product data so it can be selected on the very
   * first render.
   */
  const firstColorGalleryColorId =
    product.colorGalleries?.references?.nodes?.[0]?.fields?.find(
      (field) => field.key === 'color',
    )?.reference?.id || null;

  const [selectedColorId, setSelectedColorId] = useState(
    firstColorGalleryColorId,
  );

  const images = product.images?.nodes ?? [];

  const colors =
    product.colorPattern?.references?.nodes
      ?.slice(0, 3)
      .map((color) => {
        const labelField = color.fields?.find(
          (field) => field.key === 'label',
        );

        const colorField = color.fields?.find(
          (field) => field.key === 'color',
        );

        const imageField = color.fields?.find(
          (field) => field.key === 'image',
        );

        return {
          id: color.id,
          name: labelField?.value || 'Color',
          color: colorField?.value || null,
          image: imageField?.value || null,
        };
      }) || [];

  /*
   * Color Galleries
   *
   * Each Color Gallery contains:
   * - color -> reference to Shopify Color
   * - images -> list of Shopify images
   */
  const colorGalleries =
    product.colorGalleries?.references?.nodes
      ?.map((gallery) => {
        const colorField = gallery.fields?.find(
          (field) => field.key === 'color',
        );

        const imagesField = gallery.fields?.find(
          (field) => field.key === 'images',
        );

        /*
         * Get the Color metaobject ID referenced by
         * the Color Gallery.
         */
        const colorId = colorField?.reference?.id || null;

        /*
         * Get all images referenced by this Color Gallery.
         */
        const galleryImages =
          imagesField?.references?.nodes
            ?.map((image) => {
              /*
               * Shopify Image (File) fields normally return
               * MediaImage references.
               */
              if (
                image?.__typename === 'MediaImage' &&
                image?.image
              ) {
                return {
                  id: image.id,
                  url: image.image.url,
                  altText: image.image.altText,
                  width: image.image.width,
                  height: image.image.height,
                };
              }

              /*
               * Fallback for GenericFile references.
               */
              if (
                image?.__typename === 'GenericFile' &&
                image?.url
              ) {
                return {
                  id: image.id,
                  url: image.url,
                  altText: '',
                  width: undefined,
                  height: undefined,
                };
              }

              return null;
            })
            .filter(Boolean) || [];

        return {
          id: gallery.id,
          colorId,
          images: galleryImages,
        };
      })
      .filter(
        (gallery) =>
          gallery.colorId && gallery.images.length > 0,
      ) || [];

  /*
   * Find the Color Gallery belonging to the selected color.
   */
  const selectedColorGallery = colorGalleries.find(
    (gallery) => gallery.colorId === selectedColorId,
  );

  /*
   * Use the selected color's gallery images.
   *
   * If no color has been selected, use the normal product
   * media exactly as before.
   *
   * If the selected color does not have a gallery, also
   * fall back to the normal product media.
   */
  const activeImages =
    selectedColorGallery?.images?.length > 0
      ? selectedColorGallery.images
      : images;

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
    if (!isHovered || activeImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveImageIndex((currentIndex) => currentIndex + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, activeImages.length]);

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
   */
  const handleTransitionEnd = () => {
    if (
      activeImages.length > 1 &&
      activeImageIndex === activeImages.length
    ) {
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
    activeImages.length > 1
      ? [...activeImages, ...activeImages]
      : activeImages;

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
            className={`absolute inset-0 flex h-full w-full ${
              disableTransition
                ? ''
                : 'transition-transform duration-700 ease-in-out'
            }`}
            style={{
              transform: `translateX(-${activeImageIndex * 100}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {sliderImages.map((image, imageIndex) => (
              <div
                key={`${image.id}-${imageIndex}`}
                className="h-full min-w-full"
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
          <div className="absolute left-3 top-3 rounded-full bg-[#345225] px-4 py-1 text-[14px] font-semibold uppercase text-[#FFDF9E]">
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
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.name}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setSelectedColorId(color.id);
                  setActiveImageIndex(0);
                  setDisableTransition(true);

                  requestAnimationFrame(() => {
                    setDisableTransition(false);
                  });
                }}
                className={`h-6 w-6 overflow-hidden rounded border ${
                  selectedColorId === color.id
                    ? 'border-2 border-[#345225]'
                    : 'border-white/70'
                }`}
                style={
                  color.image
                    ? {
                        backgroundImage: `url(${color.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {
                        backgroundColor:
                          color.color || '#c8c8b0',
                      }
                }
              />
            ))}
          </div>

          <button
            type="button"
            aria-label={`View ${product.title}`}
            className="flex h-7 w-7 items-center justify-center rounded bg-white text-xs shadow-sm"
          >
            <ShoppingCart
              className="h-4 w-4 text-[#345225]"
              strokeWidth={2}
            />
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