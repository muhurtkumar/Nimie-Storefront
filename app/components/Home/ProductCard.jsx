import {useEffect, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Heart, ShoppingCart, X} from 'lucide-react';

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

export function ProductCard({
  product,
  index,
  initialColorId = null,
  showColorPalette = true,
  showBadge = true,
  wishlistLayout = false,
  wishlist = [],
  onWishlistRemoved,
}) {
  const wishlistFetcher = useFetcher();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);

  /* Get the first color gallery's color ID directly from the product data so it can be selected on the very first render. */
  const firstColorGalleryColorId =
    product.colorGalleries?.references?.nodes?.[0]?.fields?.find(
      (field) => field.key === 'color',
    )?.reference?.id || null;

  const [selectedColorId, setSelectedColorId] = useState(
    initialColorId || firstColorGalleryColorId,
  );

  const [isWishlisted, setIsWishlisted] = useState(
    Boolean(initialColorId),
  );

  useEffect(() => {
    if (initialColorId) {
      return;
    }

    if (!selectedColorId) {
      setIsWishlisted(false);
      return;
    }

    // Don't let the old wishlist prop overwrite the
    // state while the current wishlist request is running.
    if (wishlistFetcher.state !== 'idle') {
      return;
    }

    // Use the latest wishlist returned by the toggle action.
    if (
      wishlistFetcher.data?.success &&
      wishlistFetcher.data?.wishlist
    ) {
      const saved = wishlistFetcher.data.wishlist.some(
        (item) =>
          item?.productId === product.id &&
          item?.colorId === selectedColorId,
      );

      setIsWishlisted(saved);
      return;
    }

    const saved = wishlist.some(
      (item) =>
        item?.productId === product.id &&
        item?.colorId === selectedColorId,
    );

    setIsWishlisted(saved);
  }, [
    wishlist,
    product.id,
    selectedColorId,
    initialColorId,
    wishlistFetcher.state,
    wishlistFetcher.data,
  ]);


useEffect(() => {
  if (initialColorId) {
    setSelectedColorId(initialColorId);
    setActiveImageIndex(0);
  }
}, [initialColorId]);

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

  /* Color Galleries */
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

        /* Get all images referenced by this Color Gallery. */
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

  const selectedColorName = colors.find(
    (color) => color.id === selectedColorId,
  )?.name;

  /*
   * Shopify inventory for the currently selected color.
   */
  const selectedColorVariants =
    product.variants?.nodes?.filter((variant) => {
      const colorOption = variant.selectedOptions?.find(
        (option) =>
          option.name?.toLowerCase() === 'color',
      );

      return (
        colorOption?.value?.trim().toLowerCase() ===
        selectedColorName?.trim().toLowerCase()
      );
    }) || [];

  const isSelectedColorSoldOut =
    selectedColorVariants.length > 0 &&
    selectedColorVariants.every(
      (variant) => (variant.quantityAvailable ?? 0) <= 0,
    );

  const isColorSoldOut = (colorName) => {
    const colorVariants =
      product.variants?.nodes?.filter((variant) => {
        const colorOption =
          variant.selectedOptions?.find(
            (option) =>
              option.name?.toLowerCase() === 'color',
          );

        return (
          colorOption?.value?.trim().toLowerCase() ===
          colorName?.trim().toLowerCase()
        );
      }) || [];

    return (
      colorVariants.length > 0 &&
      colorVariants.every(
        (variant) => (variant.quantityAvailable ?? 0) <= 0,
      )
    );
  };

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

  const handleWishlistToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedColorId) {
      return;
    }

    wishlistFetcher.submit(
      {
        intent: 'toggle',
        productId: product.id,
        colorId: selectedColorId,
      },
      {
        method: 'post',
        action: '/wishlist',
      },
    );
  };

  useEffect(() => {
    if (!wishlistFetcher.data?.success) {
      return;
    }

    const wasRemoved = wishlistFetcher.data.added === false;

    setIsWishlisted(!wasRemoved);

    if (wasRemoved && wishlistLayout && onWishlistRemoved) {
      onWishlistRemoved(product.id, selectedColorId);
    }
  }, [
    wishlistFetcher.data,
    wishlistLayout,
    onWishlistRemoved,
    product.id,
    selectedColorId,
  ]);

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
      to={
        selectedColorName
          ? `/products/${product.handle}?Size=XS&Color=${encodeURIComponent(
              selectedColorName,
            )}`
          : `/products/${product.handle}?Size=XS`
      }
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
        {/* Sold-out translucent overlay */}
        {isSelectedColorSoldOut && (
          <div className="absolute inset-0 z-10 bg-white/50" />
        )}

        {/* Sold out overlay */}
        {showBadge && isSelectedColorSoldOut && (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-[#345225] px-4 py-1 text-[14px] font-semibold uppercase text-[#FFDF9E]">
            SOLD OUT
          </div>
        )}

        {/* Out of stock text: top right on small screens */}
        {isSelectedColorSoldOut && (
          <span className="absolute right-3 top-3 z-20 text-[14px] font-semibold uppercase text-[#82272D] md:hidden">
            OUT OF STOCK
          </span>
        )}

        {/* Product tag */}
        {showBadge && !isSelectedColorSoldOut && badge && (
          <div className="absolute left-auto right-3 top-3 rounded-full bg-[#345225] px-4 py-1 text-[14px] font-semibold uppercase text-[#FFDF9E] md:left-3 md:right-auto">
            {badge}
          </div>
        )}

        {/* Heart icon */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          onClick={handleWishlistToggle}
          disabled={wishlistFetcher.state !== 'idle'}
          className="absolute bottom-3 right-3 top-auto z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white md:bottom-auto md:right-4 md:top-4 md:h-auto md:w-auto md:rounded-none md:bg-transparent"
        >
          <Heart
            className={`h-5 w-5 md:h-8 md:w-8 ${
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-[#345225] md:text-[#FFDF9E]'
            }`}
            strokeWidth={1.8}
          />
        </button>

        {/* Bottom controls */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pr-12 md:pr-0">
          {showColorPalette && (
            <div className="flex items-center gap-2">
              {colors.map((color) => {
                const colorSoldOut = isColorSoldOut(color.name);
                const isSelected =
                  selectedColorId === color.id;

                return (
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
                    className={`relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
                      isSelected
                        ? 'h-7 w-7 scale-110 z-10'
                        : 'h-6 w-6 scale-100'
                    }`}
                  >
                    <span
                      className={`block h-full w-full overflow-hidden rounded border ${
                        isSelected
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

                    {colorSoldOut && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <X
                          className="h-full w-full text-[#C0BDBD]"
                          strokeWidth={2}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isSelectedColorSoldOut && (
            <span className="hidden text-[14px] font-semibold uppercase text-[#82272D] md:block">
              OUT OF STOCK
            </span>
          )}
        </div>
      </div>

      {wishlistLayout ? (
        <div className="px-3 py-3">
          {/* Product title */}
          <h3 className="line-clamp-2 text-[12px] font-semibold leading-4 text-[#345225]">
            {product.title}
          </h3>

          {/* Product type / tag */}
          <div className="mt-1 text-[11px] text-stone-600">
            {product.productType}
          </div>

          {/* Price row */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[16px] font-bold leading-5 text-black">
              {formatPrice(
                discountedPriceAmount,
                currentPrice?.currencyCode,
              )}
            </span>

            {hasDiscount && (
              <>
                <span className="self-center text-[11px] font-bold text-[#345225]">
                  {discountPercentage}% OFF
                </span>

                <span className="self-center text-[12px] text-[#e98b8b] line-through">
                  {formatPrice(
                    originalPriceAmount,
                    currentPrice?.currencyCode,
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        ) : (
        <>
        {/* Small screens: title on top, then type + discount + prices on one row */}
        <div className="px-3 py-3 md:hidden">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#111]">
            {product.title}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[13px] text-stone-600">
              {product.productType}
            </span>

            <div className="flex items-center gap-2">
              {hasDiscount && (
                <>
                  <span className="rounded-full bg-[#345225] px-2 py-0.5 text-[11px] font-bold text-[#FFDF9E]">
                    {discountPercentage}% OFF
                  </span>

                  <span className="text-[14px] font-bold text-[#e98b8b] line-through">
                    {formatPrice(
                      originalPriceAmount,
                      currentPrice?.currencyCode,
                    )}
                  </span>
                </>
              )}

              <span className="text-[20px] font-bold leading-5 text-black">
                {formatPrice(
                  discountedPriceAmount,
                  currentPrice?.currencyCode,
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden h-[88px] px-3 py-3 md:block md:h-[108px] lg:h-[88px]">
          <div className="flex items-start justify-between gap-3">

            {/* Left: Product information */}
            <div className="min-w-0 flex-1">

              {/* Fixed-height title area */}
              <div className="h-[32px] md:h-[40px] lg:h-[32px]">
                <h3 className="line-clamp-2 text-[14px] font-semibold leading-4 text-[#345225] md:leading-5 lg:leading-4">
                  {product.title}
                </h3>
              </div>

              {/* Product type always starts at the same vertical position */}
              <div className="mt-3 text-[13px] text-stone-600 md:mt-5 lg:mt-3">
                {product.productType}
              </div>
            </div>

            {/* Right: Price information */}
            <div className="shrink-0 text-right">
              <div className="flex items-center justify-end gap-3">

                {hasDiscount && (
                  <span className="text-[13px] font-bold text-[#345225]">
                    {discountPercentage}% OFF
                  </span>
                )}

                <span className="text-[20px] font-bold leading-5 text-black md:leading-6 lg:leading-5">
                  {formatPrice(
                    discountedPriceAmount,
                    currentPrice?.currencyCode,
                  )}
                </span>
              </div>

              {hasDiscount && (
                <div className="mt-6 text-[14px] text-[#e98b8b] line-through md:mt-9 lg:mt-6">
                  {formatPrice(
                    originalPriceAmount,
                    currentPrice?.currencyCode,
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
        </>
      )}
    </Link>
  );
}