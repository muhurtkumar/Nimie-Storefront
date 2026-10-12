import {useEffect, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {useIsLoggedIn} from '~/lib/use-is-logged-in';
import {Image, CartForm} from '@shopify/hydrogen';
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
    const navigate = useNavigate();
    const cartFetcher = useFetcher();
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [selectedQuickAddSize, setSelectedQuickAddSize] = useState('');

    const isLoggedIn = useIsLoggedIn();

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

    const quickAddCartLineAttributes = [
  ...(activeImages[0]?.url
    ? [{key: '_image', value: activeImages[0].url}]
    : []),
  ...(discountPercentage > 0
    ? [
        {
          key: '_discount_percentage',
          value: String(discountPercentage),
        },
      ]
    : []),
];

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

      // Not logged in: go to login instead of toggling the heart
      if (isLoggedIn === false) {
        navigate('/account/login');
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

  useEffect(() => {
    if (wishlistFetcher.data?.isLoggedIn === false) {
      navigate('/account/login');
    }
  }, [wishlistFetcher.data, navigate]);

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
    <>
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

        {/* Quick-add cart icon — Wishlist cards only */}
        {wishlistLayout && (
          <button
            type="button"
            aria-label={`Choose size for ${product.title}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              const availableSizes = product.variants?.nodes
                ?.filter((variant) => {
                  const colorOption = variant.selectedOptions?.find(
                    (option) => option.name.toLowerCase() === 'color',
                  );

                  const matchesColor =
                    !selectedColorName ||
                    colorOption?.value?.trim().toLowerCase() ===
                      selectedColorName.trim().toLowerCase();

                  return (
                    matchesColor &&
                    variant.availableForSale &&
                    (variant.quantityAvailable ?? 0) > 0
                  );
                })
                .map((variant) =>
                  variant.selectedOptions?.find(
                    (option) => option.name.toLowerCase() === 'size',
                  )?.value,
                )
                .filter(Boolean);

              setSelectedQuickAddSize(availableSizes?.[0] || '');
              setIsQuickAddOpen(true);
            }}
            className="absolute right-3 top-3 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white shadow-sm transition hover:bg-[#f8f1df]"
          >
            <ShoppingCart
              className="h-5 w-5 text-[#345225]"
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* Heart icon (z-30 keeps it above the bottom controls row) */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          onClick={handleWishlistToggle}
          disabled={wishlistFetcher.state !== 'idle'}
          className="absolute bottom-3 right-3 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white md:h-8 md:w-8"
        >
          <Heart
            className={`pointer-events-none h-5 w-5 md:h-6 md:w-6 ${
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-[#345225]'
            }`}
            strokeWidth={1.8}
          />
        </button>

        {/* Bottom controls (pointer-events-none so it never blocks the heart) */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pr-12">
          {showColorPalette && (
            <div className="pointer-events-auto flex items-center gap-2">
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
          <div className="px-3 pt-3 pb-1 md:hidden">
            <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#111]">
              {product.title}
            </h3>

            <div className="mt-0 flex items-center justify-between gap-3">
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

          <div className="hidden h-[88px] px-3 py-2 md:block md:h-[108px] lg:h-[78px]">
            <div className="flex items-start justify-between gap-3">
              {/* Left: Product information */}
              <div className="min-w-0 flex-1">
                {/* Fixed-height title area */}
                <div className="min-h-[32px] md:min-h-[40px] lg:min-h-[32px]">
                  <h3 className="line-clamp-2 text-[16px] font-semibold leading-6 text-[#345225]">
                    {product.title}
                  </h3>
                </div>

                {/* Product type only */}
                <div className="mt-0 pb-1 text-[15px] leading-6 text-stone-600 md:mt-2 lg:mt-0">
                  {product.productType}
                </div>
              </div>

              {/* Right: Price information */}
                            <div className="shrink-0 text-right">
                <div className="flex flex-col items-end">
                  <div className="flex min-h-[32px] items-start justify-end gap-3 md:min-h-[40px] lg:min-h-[32px]">
                    {hasDiscount && (
                      <span className="relative top-[2px] text-[14px] font-bold leading-6 text-[#345225]">
                        {discountPercentage}% OFF
                      </span>
                    )}

                    <span className="text-[20px] font-bold leading-6 text-black">
                      {formatPrice(
                        discountedPriceAmount,
                        currentPrice?.currencyCode,
                      )}
                    </span>
                  </div>

                  {hasDiscount && (
                    <span className="mt-0 pb-1 text-[15px] leading-6 text-[#e98b8b] line-through md:mt-2 lg:mt-0">
                      {formatPrice(
                        originalPriceAmount,
                        currentPrice?.currencyCode,
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Link>
    {isQuickAddOpen && (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
        onClick={() => setIsQuickAddOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Choose size for ${product.title}`}
          className="relative w-full max-w-[360px] rounded-xl bg-white p-5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setIsQuickAddOpen(false)}
            className="absolute right-3 top-3 text-stone-500 hover:text-black"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3 border-b border-stone-200 pb-4 pr-2">
            {(activeImages[0] || product.featuredImage) && (
              <div className="h-[110px] w-[88px] overflow-hidden rounded-md">
                <Image
                  data={activeImages[0] || product.featuredImage}
                  sizes="88px"
                  className="block h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0 pr-0">
              <h3 className="break-words text-sm font-medium leading-5 text-stone-900">
                {product.title}
              </h3>

              <div className="mt-3 flex flex-nowrap items-center gap-2 whitespace-nowrap">
                <p className="shrink-0 font-semibold leading-5 text-stone-900">
                  {formatPrice(
                    discountedPriceAmount,
                    currentPrice?.currencyCode,
                  )}
                </p>

                {hasDiscount && (
                  <>
                    <p className="shrink-0 text-xs text-stone-400 line-through">
                      {formatPrice(
                        originalPriceAmount,
                        currentPrice?.currencyCode,
                      )}
                    </p>

                    <p className="shrink-0 text-xs font-semibold text-[#e98b8b]">
                      ({discountPercentage}% OFF)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold text-stone-900">
            Select Size
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants?.nodes
              ?.filter((variant) => {
                const colorOption = variant.selectedOptions?.find(
                  (option) => option.name.toLowerCase() === 'color',
                );

                const matchesColor =
                  !selectedColorName ||
                  colorOption?.value?.trim().toLowerCase() ===
                    selectedColorName.trim().toLowerCase();

                return (
                  matchesColor &&
                  variant.selectedOptions?.some(
                    (option) => option.name.toLowerCase() === 'size',
                  )
                );
              })
              .map((variant) => {
                const size = variant.selectedOptions.find(
                  (option) => option.name.toLowerCase() === 'size',
                )?.value;

                const available =
                variant.availableForSale &&
                (variant.quantityAvailable ?? 0) > 0;
                const selected = selectedQuickAddSize === size;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedQuickAddSize(size)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                      selected
                        ? 'border-[#345225] bg-[#345225] text-white'
                        : 'border-stone-200 text-stone-800'
                    } ${
                      !available
                        ? 'cursor-not-allowed opacity-30 line-through'
                        : 'cursor-pointer'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
          </div>

          <button
            type="button"
            disabled={!selectedQuickAddSize || cartFetcher.state !== 'idle'}
            onClick={() => {
              const variant = product.variants?.nodes?.find((item) => {
                const size = item.selectedOptions?.find(
                  (option) => option.name.toLowerCase() === 'size',
                )?.value;

                const color = item.selectedOptions?.find(
                  (option) => option.name.toLowerCase() === 'color',
                )?.value;

                return (
                  size === selectedQuickAddSize &&
                  (!selectedColorName ||
                    color?.trim().toLowerCase() ===
                      selectedColorName.trim().toLowerCase()) &&
                  item.availableForSale
                );
              });

              if (!variant) return;

              cartFetcher.submit(
                {
                  [CartForm.INPUT_NAME]: JSON.stringify({
                    action: CartForm.ACTIONS.LinesAdd,
                    inputs: {
                      lines: [
                        {
                          merchandiseId: variant.id,
                          quantity: 1,
                          attributes: quickAddCartLineAttributes,
                        },
                      ],
                    },
                  }),
                },
                {
                  method: 'POST',
                  action: '/cart',
                },
              );

            }}
            className="mt-6 w-full rounded-md bg-[#345225] py-3 text-sm font-semibold text-white transition hover:bg-[#293f1d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cartFetcher.state !== 'idle' ? 'Adding...' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    )}
    </>
  );
}