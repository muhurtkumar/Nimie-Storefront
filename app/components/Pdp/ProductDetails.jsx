import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Ruler,
  Star,
  Heart,
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

  discountPercentage: 40,

  fabricDetails:
    'Pure cotton-linen fabric with traditional Lucknow Chikankari embroidery. Designed with an oversized silhouette for a relaxed fit.',

  washCare:
    'Gentle hand wash recommended. Wash separately with mild detergent and dry in shade.',
};

export function ProductDetails({
  product,
  selectedVariant,
  productOptions,
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  const [selectedColor, setSelectedColor] =
    useState(null);

  const [selectedColorId, setSelectedColorId] =
    useState(null);

  const [selectedSize, setSelectedSize] =
    useState(null);

  const [quantity, setQuantity] = useState(1);

  const [openSection, setOpenSection] = useState(null);

  const navigate = useNavigate();

  /* Shopify product images */
  const images = product.images?.nodes ?? [];

  const colorOption = product.options?.find(
    (option) =>
      option.name?.toLowerCase() === 'color',
  );

  const sizeOption = product.options?.find(
    (option) =>
      option.name?.toLowerCase() === 'size',
  );

  /* Shopify colors */
  const colors = colorOption?.optionValues ?? [];

  /* Shopify sizes */
  const sizes = sizeOption?.optionValues ?? [];

  const colorPatternColors =
    product.colorPattern?.references?.nodes
      ?.map((color) => {
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
   * Color galleries
   *
   * Each Color Gallery contains:
   * - color -> reference to Shopify Color metaobject
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
         * this Color Gallery.
         */
        const colorId =
          colorField?.reference?.id || null;

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
          gallery.colorId &&
          gallery.images.length > 0,
      ) || [];

  /*
   * Set initial color from selected variant.
   *
   * The selected variant provides the Shopify color name.
   * We then find the matching Color metaobject so that
   * selectedColorId points to the Color Gallery correctly.
   */
  useEffect(() => {
    if (!selectedVariant?.selectedOptions) {
      return;
    }

    const color = selectedVariant.selectedOptions.find(
      (option) =>
        option.name?.toLowerCase() === 'color',
    );

    if (color?.value) {
      const colorName = color.value.trim();

      setSelectedColor(colorName);

      const matchingColor =
        colorPatternColors.find(
          (item) =>
            item.name?.trim().toLowerCase() ===
            colorName.toLowerCase(),
        );

      setSelectedColorId(
        matchingColor?.id || null,
      );
    }
  }, [selectedVariant, colorPatternColors]);

  /*
   * Set initial size from selected variant.
   */
  useEffect(() => {
    if (!selectedVariant?.selectedOptions) {
      return;
    }

    const size = selectedVariant.selectedOptions.find(
      (option) =>
        option.name?.toLowerCase() === 'size',
    );

    if (size?.value) {
      setSelectedSize(size.value);
    }
  }, [selectedVariant]);

  /*
   * Find the Color Gallery belonging to
   * the selected color.
   */
  const selectedColorGallery = colorGalleries.find(
    (gallery) =>
      gallery.colorId === selectedColorId,
  );

  const galleryImages = useMemo(() => {
    if (selectedColorGallery?.images?.length > 0) {
      return selectedColorGallery.images;
    }

    if (images.length > 0) {
      return images;
    }

    if (selectedVariant?.image) {
      return [selectedVariant.image];
    }

    return [];
  }, [
    selectedColorGallery,
    images,
    selectedVariant,
  ]);

  /* Keep selected image valid when product or color changes. */
  useEffect(() => {
    setSelectedImage(0);
  }, [product.id, selectedColorId]);

  /* Shopify price data */
  const price = selectedVariant?.price;

  const compareAtPrice =
    selectedVariant?.compareAtPrice;

  /* Static discount for now. */
  const discountPercentage =
    STATIC_PRODUCT_INFO.discountPercentage;

  /* Quantity controls */
  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  };

  /* Accordion */
  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section,
    );
  };

  /* Move image backwards.*/
  const previousImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1,
    );
  };

  /* Move image forwards. */
  const nextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1,
    );
  };

  return (
    <main className="min-h-screen bg-[#fff8e9] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">

          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <div className="flex min-w-0 gap-4">

            {/* Desktop thumbnails */}
            <div className="relative hidden w-[72px] shrink-0 sm:block">
              <div className="flex max-h-[calc(100vh-32px)] flex-col gap-2 overflow-hidden">

                {galleryImages.map((image, index) => (
                  <button
                    key={`${image.id}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`relative h-[96px] w-[72px] shrink-0 overflow-hidden rounded-md transition ${
                      selectedImage === index
                        ? 'ring-2 ring-[#345225]'
                        : ''
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={
                        image.altText ||
                        `${product.title} ${index + 1}`
                      }
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}

              </div>
            </div>

            {/* Mobile thumbnails */}
            <div className="absolute z-10 mt-2 flex max-w-[calc(100%-32px)] gap-2 overflow-x-auto sm:hidden">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.id}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedImage(index)
                  }
                  className={`h-16 w-14 shrink-0 overflow-hidden rounded-md ${
                    selectedImage === index
                      ? 'ring-2 ring-[#345225]'
                      : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={
                      image.altText ||
                      `${product.title} ${index + 1}`
                    }
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative min-w-0 flex-1">
              <div className="aspect-[4/4.5] w-full overflow-hidden rounded-xl bg-[#e8e0c8]">

                {galleryImages.length > 0 ? (
                  <img
                    src={
                      galleryImages[selectedImage]?.url
                    }
                    alt={
                      galleryImages[selectedImage]
                        ?.altText ||
                      product.title
                    }
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

          <div className="flex flex-col pt-1 lg:pt-2">

            {/* Rating - STATIC */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({length: 5}).map(
                  (_, index) => (
                    <Star
                      key={index}
                      className="h-[15px] w-[15px] fill-[#f5b51b] text-[#f5b51b]"
                      strokeWidth={1}
                    />
                  ),
                )}
              </div>

              <span className="text-[11px] font-semibold text-[#345225]">
                {STATIC_PRODUCT_INFO.rating}/5
              </span>
            </div>

            {/* Product title */}
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[25px] font-bold leading-[1.1] text-[#ad3d9f] sm:text-[29px] lg:text-[30px]">
                  {product.title}
                </h1>

                {/* STATIC product type */}
                <p className="mt-1 text-[16px] text-stone-600">
                  {STATIC_PRODUCT_INFO.type}
                </p>
              </div>

              <button
                type="button"
                aria-label="Add to wishlist"
                className="mt-1 shrink-0"
              >
                <Heart
                  className="h-6 w-6 text-[#345225]"
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Price - SHOPIFY */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-[25px] font-bold leading-none text-black">
                {formatPrice(
                  price?.amount,
                  price?.currencyCode,
                )}
              </span>

              {compareAtPrice?.amount && (
                <span className="text-[18px] text-[#e98b8b] line-through">
                  {formatPrice(
                    compareAtPrice.amount,
                    compareAtPrice.currencyCode,
                  )}
                </span>
              )}

              {/* STATIC discount */}
              <span className="rounded-full bg-[#345225] px-3 py-1 text-[11px] font-medium text-[#ffdf9e]">
                {discountPercentage}% OFF
              </span>
            </div>

            {/* Description - SHOPIFY */}
            <div
              className="mt-3 max-w-[650px] text-[11px] leading-[1.55] text-stone-500"
              dangerouslySetInnerHTML={{
                __html:
                  product.descriptionHtml ||
                  product.description ||
                  '',
              }}
            />

            <div className="my-3 border-b border-stone-300" />

            {/* =================================================
                COLORS - SHOPIFY
            ================================================== */}

            {colors.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] text-stone-600">
                  Select Colors
                </p>

                <div className="flex items-center gap-2.5">

                  {colors.map((color) => {
                    const isSelected =
                      selectedColor === color.name;

                    const swatchColor =
                      color.swatch?.color ||
                      '#c8c8b0';

                    const swatchImage =
                      color.swatch?.image
                        ?.previewImage?.url;

                    return (
                      <button
                        key={color.name}
                        type="button"
                        title={color.name}
                        aria-label={`Select ${color.name}`}
                        onClick={() => {
                          setSelectedColor(color.name);

                          const matchingColor =
                            colorPatternColors.find(
                              (item) =>
                                item.name
                                  ?.trim()
                                  .toLowerCase() ===
                                color.name
                                  ?.trim()
                                  .toLowerCase(),
                            );

                          setSelectedColorId(
                            matchingColor?.id || null,
                          );

                          setSelectedImage(0);

                          const params =
                            new URLSearchParams();

                          if (selectedSize) {
                            params.set(
                              'Size',
                              selectedSize,
                            );
                          }

                          params.set(
                            'Color',
                            color.name,
                          );

                          navigate(
                            `?${params.toString()}`,
                            {
                              replace: true,
                              preventScrollReset: true,
                            },
                          );
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
                                  backgroundSize:
                                    'cover',
                                  backgroundPosition:
                                    'center',
                                }
                              : {
                                  backgroundColor:
                                    swatchColor,
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
              <div className="mt-4">

                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] text-stone-600">
                    Choose Size
                  </p>

                  {/* STATIC */}
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[10px] uppercase text-stone-600"
                  >
                    <Ruler className="h-3 w-3" />
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">

                  {sizes.map((size) => {
                    const isSelected =
                      selectedSize === size.name;

                    const variant =
                      size.firstSelectableVariant;

                    const unavailable =
                      variant &&
                      !variant.availableForSale;

                    return (
                      <button
                        key={size.name}
                        type="button"
                        disabled={unavailable}
                        onClick={() => {
                          setSelectedSize(size.name);

                          const params =
                            new URLSearchParams();

                          params.set(
                            'Size',
                            size.name,
                          );

                          if (selectedColor) {
                            params.set(
                              'Color',
                              selectedColor,
                            );
                          }

                          navigate(
                            `?${params.toString()}`,
                            {
                              replace: true,
                              preventScrollReset: true,
                            },
                          );
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
              </div>
            )}

            {/* =================================================
                QUANTITY + ADD TO CART
            ================================================== */}

            <div className="mt-5 flex items-center gap-3">

              <div className="flex h-8 flex-1 items-center justify-between rounded-full bg-white px-3">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="flex h-6 w-6 items-center justify-center text-[#345225]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="text-[11px] text-stone-700">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex h-6 w-6 items-center justify-center text-[#345225]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>

              </div>

              {/* Static button for now */}
              <button
                type="button"
                className="h-8 flex-[2.5] rounded-full bg-[#ad3d9f] text-[11px] font-medium text-white transition hover:bg-[#96348a]"
              >
                Add to Cart
              </button>

            </div>

            {/* =================================================
                ACCORDIONS - STATIC
            ================================================== */}

            <div className="mt-5 border-t border-[#6c655a]">

              {/* Fabric details */}
              <button
                type="button"
                onClick={() =>
                  toggleSection('fabric')
                }
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
                  {STATIC_PRODUCT_INFO.fabricDetails}
                </div>
              )}

              {/* Wash care */}
              <button
                type="button"
                onClick={() =>
                  toggleSection('wash')
                }
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
    </main>
  );
}