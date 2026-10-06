import {useEffect, useMemo, useState} from 'react';
import {useFetcher, useNavigate} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Ruler,
  Star,
  Heart,
  X,
} from 'lucide-react';

function formatPrice(amount, currencyCode = 'INR') {
  if (amount == null) {
    return '';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Number(amount))
    .replace(/\s/g, '');
}

/*
 * Static information for now.
 * These can later come from Shopify metafields.
 */
const STATIC_PRODUCT_INFO = {
  type: 'Kurti',

  rating: 4.5,

  reviews: 5,

  fabricDetails:
    'Pure cotton-linen fabric with traditional Lucknow Chikankari embroidery. Designed with an oversized silhouette for a relaxed fit.',

  washCare:
    'Gentle hand wash recommended. Wash separately with mild detergent and dry in shade.',
};

export function ProductDetails({
  product,
  selectedVariant,
  productOptions,
  wishlist = [],
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedColorId, setSelectedColorId] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [optimisticWishlistKey, setOptimisticWishlistKey] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [openSection, setOpenSection] = useState(null);

  /* Size Guide */
  const [openSizeGuide, setOpenSizeGuide] = useState(false);

  const navigate = useNavigate();
  const wishlistFetcher = useFetcher();

  const handleWishlistToggle = () => {
    if (!selectedColorId) {
      return;
    }

    const wishlistKey = `${product.id}-${selectedColorId}`;

    setOptimisticWishlistKey(wishlistKey);

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
    if (wishlistFetcher.data?.success) {
      setIsWishlisted(Boolean(wishlistFetcher.data.added));
    }
  }, [wishlistFetcher.data]);

  /* Shopify product images */
  const images = product.images?.nodes ?? [];

  const colorOption = product.options?.find(
    (option) => option.name?.toLowerCase() === 'color',
  );

  const sizeOption = product.options?.find(
    (option) => option.name?.toLowerCase() === 'size',
  );

  /* Shopify colors */
  const colors = colorOption?.optionValues ?? [];

  /* Shopify sizes */
  const sizes = sizeOption?.optionValues ?? [];

  /* Shopify inventory for the currently selected color */
  const selectedColorVariants = useMemo(() => {
    const activeColor =
      selectedColor ||
      selectedVariant?.selectedOptions?.find(
        (option) => option.name?.toLowerCase() === 'color',
      )?.value;

    if (!activeColor) {
      return [];
    }

    return (
      product.variants?.nodes?.filter((variant) => {
        const colorOption = variant.selectedOptions?.find(
          (option) => option.name?.toLowerCase() === 'color',
        );

        return (
          colorOption?.value?.trim().toLowerCase() ===
          activeColor.trim().toLowerCase()
        );
      }) || []
    );
  }, [product.variants, selectedColor, selectedVariant]);

  /* Check if every size for the selected color is sold out */
  const isColorSoldOut =
    selectedColorVariants.length > 0 &&
    selectedColorVariants.every(
      (variant) => (variant.quantityAvailable ?? 0) <= 0,
    );

  const colorPatternColors =
    product.colorPattern?.references?.nodes?.map((color) => {
      const labelField = color.fields?.find((field) => field.key === 'label');

      const colorField = color.fields?.find((field) => field.key === 'color');

      const imageField = color.fields?.find((field) => field.key === 'image');

      return {
        id: color.id,
        name: labelField?.value || 'Color',
        color: colorField?.value || null,
        image: imageField?.value || null,
      };
    }) || [];

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
         * this Color Gallery.
         */
        const colorId = colorField?.reference?.id || null;

        /*
         * Get all images referenced by this
         * Color Gallery.
         */
        const galleryImages =
          imagesField?.references?.nodes
            ?.map((image) => {
              /*
               * Shopify Image references normally
               * return MediaImage.
               */
              if (image?.__typename === 'MediaImage' && image?.image) {
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
              if (image?.__typename === 'GenericFile' && image?.url) {
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
      .filter((gallery) => gallery.colorId && gallery.images.length > 0) || [];

  const sizeGuideRows =
    product.sizeGuide?.references?.nodes
      ?.map((sizeGuideEntry) => {
        const sizeField = sizeGuideEntry.fields?.find(
          (field) => field.key === 'size',
        );

        const measurementsField = sizeGuideEntry.fields?.find(
          (field) => field.key === 'measurements',
        );

        let measurementValues = [];

        try {
          measurementValues = JSON.parse(measurementsField?.value || '[]');
        } catch {
          measurementValues = [];
        }

        const measurements = measurementValues
          .map((measurement) => {
            const [name, ...valueParts] = measurement.split(':');

            return {
              name: name?.trim() || '',
              value: valueParts.join(':').trim() || '',
            };
          })
          .filter((measurement) => measurement.name && measurement.value);

        return {
          size: sizeField?.value?.trim() || '',
          measurements,
        };
      })
      .filter((entry) => entry.size && entry.measurements.length > 0) || [];

  const sizeGuideColumns = Array.from(
    new Set(
      sizeGuideRows.flatMap((row) =>
        row.measurements.map((measurement) => measurement.name),
      ),
    ),
  );

  useEffect(() => {
    if (!selectedVariant?.selectedOptions) {
      return;
    }

    const color = selectedVariant.selectedOptions.find(
      (option) => option.name?.toLowerCase() === 'color',
    );

    if (color?.value) {
      const colorName = color.value.trim();

      setSelectedColor(colorName);

      const matchingColor = colorPatternColors.find(
        (item) => item.name?.trim().toLowerCase() === colorName.toLowerCase(),
      );

      setSelectedColorId(matchingColor?.id || null);
    }
  }, [selectedVariant, colorPatternColors]);

  useEffect(() => {
    if (!selectedColorId) {
      setIsWishlisted(false);
      return;
    }

    const currentWishlistKey = `${product.id}-${selectedColorId}`;

    // Keep the locally updated state after clicking the heart.
    if (optimisticWishlistKey === currentWishlistKey) {
      return;
    }

    const saved = wishlist.some(
      (item) =>
        item?.productId === product.id && item?.colorId === selectedColorId,
    );

    setIsWishlisted(saved);
  }, [wishlist, product.id, selectedColorId, optimisticWishlistKey]);

  /* Set initial size from selected variant. */
  useEffect(() => {
    if (!selectedVariant?.selectedOptions) {
      return;
    }

    const size = selectedVariant.selectedOptions.find(
      (option) => option.name?.toLowerCase() === 'size',
    );

    if (size?.value) {
      setSelectedSize(size.value);
    }
  }, [selectedVariant]);

  /* Find the Color Gallery belonging to the selected color. */
  const activeColorName =
    selectedColor ||
    selectedVariant?.selectedOptions?.find(
      (option) => option.name?.toLowerCase() === 'color',
    )?.value;

  const activeColorMetaobject = colorPatternColors.find(
    (item) =>
      item.name?.trim().toLowerCase() === activeColorName?.trim().toLowerCase(),
  );

  const selectedColorGallery = colorGalleries.find(
    (gallery) => gallery.colorId === activeColorMetaobject?.id,
  );

  const galleryImages = useMemo(() => {
    if (selectedColorGallery?.images?.length > 0) {
      return selectedColorGallery.images;
    }

    if (selectedVariant?.image) {
      return [selectedVariant.image];
    }

    return images;
  }, [selectedColorGallery, selectedVariant, images]);

  /* Keep selected image valid when product or color changes. */
  useEffect(() => {
    setSelectedImage(0);
  }, [product.id, selectedColorId]);

  /* Shopify price data */
  /* Variant matching the selected color + size */
  const cartVariant = selectedColorVariants.find((variant) =>
    variant.selectedOptions?.some(
      (option) =>
        option.name?.toLowerCase() === 'size' &&
        option.value?.trim().toLowerCase() ===
          selectedSize?.trim().toLowerCase(),
    ),
  );

  const canAddToCart =
    Boolean(cartVariant) && (cartVariant.quantityAvailable ?? 0) > 0;

  /* Shopify price data */
  const price = selectedVariant?.price;

  /*
   * Discount percentage from Shopify.
   *
   * Product metafield:
   * custom.discountpercentage
   */
  const discountPercentage = Math.min(
    Math.max(Number(product.discountPercentage?.value || 0), 0),
    100,
  );

  /* First PDP image and discount percentage stored on the cart line */
  const cartLineAttributes = [
    ...(galleryImages[0]?.url
      ? [{key: '_image', value: galleryImages[0].url}]
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
   * Original Shopify variant price.
   */
  const originalPriceAmount = Number(price?.amount || 0);

  /*
   * Calculate discounted selling price.
   *
   * Example:
   * ₹2499 with 40% discount
   * = ₹1499.4
   * = ₹1499 after rounding
   */
  const discountedPriceAmount =
    originalPriceAmount > 0 && discountPercentage > 0
      ? Math.round(originalPriceAmount * (1 - discountPercentage / 100))
      : originalPriceAmount;

  /* Quantity controls */
  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  /* Accordion */
  const toggleSection = (section) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  /* Move image backwards.*/
  const previousImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  };

  /* Move image forwards. */
  const nextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fff8e9] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[108px_minmax(0,1fr)] md:grid-cols-[136px_minmax(0,1fr)] lg:grid-cols-[140px_minmax(0,1fr)]">
            {/* Desktop thumbnails */}
            <div className="relative hidden w-full self-stretch sm:block lg:h-[660px]">
              <div className="absolute inset-0 flex flex-col gap-2 overflow-y-auto overflow-x-hidden p-[3px]">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-full shrink-0 overflow-hidden rounded-xl transition ${
                      selectedImage === index ? 'ring-2 ring-[#345225]' : ''
                    }`}
                    style={{
                      height: 'calc((100% - 24px) / 4)',
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile thumbnails */}
            <div className="order-last flex min-w-0 gap-2 overflow-x-auto p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-14 shrink-0 overflow-hidden rounded-md ${
                    selectedImage === index ? 'ring-2 ring-[#345225]' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative min-w-0 flex-1">
              <div className="aspect-[4/4.7] w-full overflow-hidden rounded-xl bg-[#e8e0c8] lg:aspect-auto lg:h-[660px]">
                {galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[selectedImage]?.url}
                    alt={galleryImages[selectedImage]?.altText || product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Mobile navigation */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-sm transition hover:bg-white sm:hidden"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-sm transition hover:bg-white sm:hidden"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE
          ====================================================== */}

          <div className="flex h-full min-h-0 flex-col pt-1 lg:h-[660px] lg:justify-center lg:pt-0">
            {/* Rating - STATIC */}
            <div className="!m-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({length: 5}).map((_, index) => (
                    <Star
                      key={index}
                      className="h-[18px] w-[18px] fill-[#f5b51b] text-[#f5b51b]"
                      strokeWidth={1}
                    />
                  ))}
                </div>

                <span className="text-[14px] font-semibold text-[#345225]">
                  {STATIC_PRODUCT_INFO.rating}/5
                </span>
              </div>

              <button
                type="button"
                aria-label={
                  isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                }
                onClick={handleWishlistToggle}
                disabled={!selectedColorId || wishlistFetcher.state !== 'idle'}
                className="relative z-10 !m-0 flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white !p-0 disabled:cursor-not-allowed"
                style={{width: 36, height: 36}}
              >
                <Heart
                  className={`pointer-events-none h-5 w-5 ${
                    isWishlisted
                      ? 'fill-red-500 text-red-500'
                      : 'text-[#345225]'
                  }`}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="!m-0">
                <h1 className="!m-0 text-[25px] font-bold leading-[0.95] text-[#ad3d9f] sm:text-[29px] lg:text-[30px]">
                  {product.title}
                </h1>

                <p className="!mt-1 !mb-0 text-[16px] leading-none text-stone-600">
                  {STATIC_PRODUCT_INFO.type}
                </p>
              </div>
            </div>

            {/* Price - CALCULATED FROM SHOPIFY PRICE + DISCOUNT */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {/* Discounted / Selling Price */}
              <span className="text-[25px] font-bold leading-none text-black">
                {formatPrice(discountedPriceAmount, price?.currencyCode)}
              </span>

              {/* Original Price */}
              {discountPercentage > 0 &&
                originalPriceAmount > discountedPriceAmount && (
                  <span className="text-[18px] text-[#e98b8b] line-through">
                    {formatPrice(originalPriceAmount, price?.currencyCode)}
                  </span>
                )}

              {/* Discount */}
              {discountPercentage > 0 && (
                <span className="rounded-full bg-[#345225] px-3 py-1 text-[11px] font-medium text-[#ffdf9e]">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Description - SHOPIFY */}
            <div
              className="mt-3 max-w-[650px] pr-2 text-[11px] leading-[1.55] text-stone-500"
              dangerouslySetInnerHTML={{
                __html: product.descriptionHtml || product.description || '',
              }}
            />

            <div className="my-3 border-b border-stone-300" />

            {/* =================================================
                COLORS - SHOPIFY
            ================================================== */}

            {colors.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] text-stone-600">Select Colors</p>

                <div className="mt-1 flex items-center gap-2.5">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color.name;

                    const swatchColor = color.swatch?.color || '#c8c8b0';

                    const swatchImage = color.swatch?.image?.previewImage?.url;

                    return (
                      <button
                        key={color.name}
                        type="button"
                        title={color.name}
                        aria-label={`Select ${color.name}`}
                        onClick={() => {
                          setSelectedColor(color.name);

                          const matchingColor = colorPatternColors.find(
                            (item) =>
                              item.name?.trim().toLowerCase() ===
                              color.name?.trim().toLowerCase(),
                          );

                          setSelectedColorId(matchingColor?.id || null);

                          setSelectedImage(0);

                          const params = new URLSearchParams();

                          if (selectedSize) {
                            params.set('Size', selectedSize);
                          }

                          params.set('Color', color.name);

                          navigate(`?${params.toString()}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                          isSelected
                            ? 'border border-[#345225]'
                            : 'border border-transparent'
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={
                            swatchImage
                              ? {
                                  backgroundImage: `url(${swatchImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : {
                                  backgroundColor: swatchColor,
                                }
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================
                SIZE - SHOPIFY
            ================================================== */}

            {sizes.length > 0 && (
              <div className="mt-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] text-stone-600">Choose Size</p>

                  {/* SIZE GUIDE */}
                  <button
                    type="button"
                    onClick={() => setOpenSizeGuide(true)}
                    className="flex items-center gap-1 text-[12px] uppercase text-stone-600 cursor-pointer"
                  >
                    <Ruler className="h-4 w-4" />
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size.name;

                    const matchingVariant = selectedColorVariants.find(
                      (variant) => {
                        const sizeOption = variant.selectedOptions?.find(
                          (option) => option.name?.toLowerCase() === 'size',
                        );

                        return (
                          sizeOption?.value?.trim().toLowerCase() ===
                          size.name?.trim().toLowerCase()
                        );
                      },
                    );

                    const inventory = matchingVariant?.quantityAvailable ?? 0;

                    const unavailable = inventory <= 0;

                    return (
                      <button
                        key={size.name}
                        type="button"
                        disabled={unavailable}
                        onClick={() => {
                          if (unavailable) {
                            return;
                          }

                          setSelectedSize(size.name);

                          const params = new URLSearchParams();

                          params.set('Size', size.name);

                          if (selectedColor) {
                            params.set('Color', selectedColor);
                          }

                          navigate(`?${params.toString()}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }}
                        className={`flex h-7 min-w-[42px] items-center justify-center rounded-full px-3 text-[10px] transition ${
                          unavailable
                            ? 'cursor-not-allowed bg-stone-400 text-stone-600'
                            : isSelected
                              ? 'bg-[#345225] text-white'
                              : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {size.name}
                      </button>
                    );
                  })}
                </div>

                {product.sizeTip?.value && (
                  <p
                    className="text-[10px] leading-4 text-stone-500"
                    style={{marginTop: '3px'}}
                  >
                    {product.sizeTip.value}
                  </p>
                )}
              </div>
            )}

            {/* =================================================
                QUANTITY + ADD TO CART / SOLD OUT
            ================================================== */}

            {isColorSoldOut ? (
              <div className="mt-5 flex items-center gap-3">
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-[18px] font-semibold text-[#345225]">
                    SOLD OUT
                  </span>
                </div>

                <button
                  type="button"
                  className="h-10 flex-[2.5] rounded-full bg-[#ad3d9f] text-[13px] font-medium text-white transition hover:bg-[#96348a] cursor-pointer"
                >
                  Notify Me When Available
                </button>
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 flex-1 items-center justify-between rounded-full bg-white px-3 font-semibold">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-6 w-6 items-center justify-center text-[#345225]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4 cursor-pointer" />
                  </button>

                  <span className="text-[13px] text-stone-700">{quantity}</span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-6 w-6 items-center justify-center text-[#345225]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4 cursor-pointer" />
                  </button>
                </div>

                <div className="flex-[2.5]">
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesAdd}
                    inputs={{
                      lines: cartVariant
                        ? [
                            {
                              merchandiseId: cartVariant.id,
                              quantity,
                              attributes: cartLineAttributes,
                            },
                          ]
                        : [],
                    }}
                  >
                    {(fetcher) => (
                      <button
                        type="submit"
                        disabled={!canAddToCart || fetcher.state !== 'idle'}
                        className="h-10 w-full rounded-full bg-[#ad3d9f] text-[13px] font-medium text-white transition hover:bg-[#96348a] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
                      </button>
                    )}
                  </CartForm>
                </div>
              </div>
            )}

            {/* =================================================
                ACCORDIONS - STATIC
            ================================================== */}

            <div className="mt-5 border-t border-[#6c655a]">
              {/* Fabric details */}
              <button
                type="button"
                onClick={() => toggleSection('fabric')}
                className="flex w-full items-center justify-between border-b border-[#6c655a] py-3 text-left"
              >
                <span className="text-[11px] font-medium text-stone-700">
                  FABRIC DETAILS
                </span>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c5d5a0]">
                  {openSection === 'fabric' ? (
                    <Minus className="h-3 w-3 text-[#345225]" />
                  ) : (
                    <Plus className="h-3 w-3 text-[#345225]" />
                  )}
                </span>
              </button>

              {openSection === 'fabric' && (
                <div className="border-b border-[#6c655a] px-1 py-3 text-[11px] leading-5 text-stone-500">
                  <div className="max-h-[40px] overflow-y-auto pr-2">
                    {(
                      product.fabricDetails?.value ||
                      STATIC_PRODUCT_INFO.fabricDetails
                    )
                      .split('\n')
                      .map((line, index) => {
                        const [heading, ...rest] = line.split(':');
                        const value = rest.join(':').trim();

                        return (
                          <div key={index}>
                            <span className="font-semibold text-stone-700">
                              {heading}:
                            </span>{' '}
                            {value}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Wash care */}
              <button
                type="button"
                onClick={() => toggleSection('wash')}
                className="flex w-full items-center justify-between border-b border-[#6c655a] py-3 text-left"
              >
                <span className="text-[11px] font-medium text-stone-700">
                  WASH CARE
                </span>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c5d5a0]">
                  {openSection === 'wash' ? (
                    <Minus className="h-3 w-3 text-[#345225]" />
                  ) : (
                    <Plus className="h-3 w-3 text-[#345225]" />
                  )}
                </span>
              </button>

              {openSection === 'wash' && (
                <div className="border-b border-[#6c655a] px-1 py-3 text-[11px] leading-5 text-stone-500">
                  {STATIC_PRODUCT_INFO.washCare}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SIZE GUIDE SLIDE-IN PANEL
      ================================================== */}

      <div
        className={`absolute inset-0 z-50 transition-all duration-500 ${
          openSizeGuide ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Background overlay */}
        <button
          type="button"
          aria-label="Close size guide"
          onClick={() => setOpenSizeGuide(false)}
          className={`absolute inset-0 h-full w-full bg-black/30 transition-opacity duration-500 ${
            openSizeGuide ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding panel */}
        <div
          className={`absolute right-0 top-0 flex h-full w-full max-w-[580px] flex-col bg-[#fff8e9] shadow-2xl transition-transform duration-500 ease-in-out ${
            openSizeGuide ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-300 px-5 py-5 sm:px-7">
            <h2 className="text-[20px] font-semibold text-[#345225]">
              Size Guide
            </h2>

            <button
              type="button"
              onClick={() => setOpenSizeGuide(false)}
              aria-label="Close size guide"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-stone-200"
            >
              <X className="h-5 w-5 text-[#345225] cursor-pointer" />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            {sizeGuideRows.length > 0 && sizeGuideColumns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="border-b border-stone-400">
                      <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#345225]">
                        Size
                      </th>

                      {sizeGuideColumns.map((column) => (
                        <th
                          key={column}
                          className="px-3 py-3 text-center text-[13px] font-semibold text-[#345225]"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sizeGuideRows.map((row) => (
                      <tr key={row.size} className="border-b border-stone-300">
                        <td className="px-3 py-4 text-left text-[13px] font-semibold text-stone-700">
                          {row.size}
                        </td>

                        {sizeGuideColumns.map((column) => {
                          const measurement = row.measurements.find(
                            (item) => item.name === column,
                          );

                          return (
                            <td
                              key={column}
                              className="px-3 py-4 text-center text-[13px] text-stone-600"
                            >
                              {measurement?.value
                                ? `${measurement.value}"`
                                : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-[13px] text-stone-500">
                Size guide information is not available for this product.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
