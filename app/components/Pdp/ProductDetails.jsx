import {useState} from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Ruler,
  Star,
  Heart,
} from 'lucide-react';

/*
 * Static product data for now.
 *
 * Later this entire object can be replaced with
 * Shopify product data.
 */
const product = {
  title: 'Halter Neck Heavy Chikankari',
  type: 'Kurti',

  rating: 4.5,
  reviews: 5,

  price: 2450,
  originalPrice: 2750,
  discount: 40,

  description:
    'Crafted in pure cotton-linen, this oversized silhouette blends together traditional Lucknow Chikankari and an effortless contemporary spirit. Featuring a V-neck, bell sleeves and tie-knot detail give it a relaxed yet elevated look, perfect for everyday wear.',

  colors: [
    {
      id: 'green',
      name: 'Green',
      value: '#d8dc9d',
    },
    {
      id: 'mint',
      name: 'Mint',
      value: '#9edbd8',
    },
    {
      id: 'olive',
      name: 'Olive',
      value: '#9b9b13',
    },
  ],

  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

  images: [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
  ],
};

export function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0].id,
  );
  const [selectedSize, setSelectedSize] = useState('XL');
  const [quantity, setQuantity] = useState(1);

  const [openSection, setOpenSection] = useState(null);

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section,
    );
  };

  return (
    <main className="min-h-screen bg-[#fff8e9] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* =====================================================
              LEFT SIDE - PRODUCT IMAGES
          ====================================================== */}

          <div className="flex min-w-0 gap-4">
            {/* Thumbnail column */}
            <div className="relative hidden w-[72px] shrink-0 sm:block">
              <div className="flex max-h-[calc(100vh-32px)] flex-col gap-2 overflow-hidden">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-[96px] w-[72px] shrink-0 overflow-hidden rounded-md transition ${
                      selectedImage === index
                        ? 'ring-2 ring-[#345225]'
                        : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Thumbnail scroll indicator */}
              {product.images.length > 5 && (
                <button
                  type="button"
                  className="absolute bottom-0 left-1/2 flex h-7 w-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile thumbnails */}
            <div className="absolute z-10 mt-2 flex max-w-[calc(100%-32px)] gap-2 overflow-x-auto sm:hidden">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-14 shrink-0 overflow-hidden rounded-md ${
                    selectedImage === index
                      ? 'ring-2 ring-[#345225]'
                      : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative min-w-0 flex-1">
              <div className="aspect-[4/4.5] w-full overflow-hidden rounded-xl bg-[#e8e0c8]">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Image navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === 0
                          ? product.images.length - 1
                          : current - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-sm transition hover:bg-white sm:hidden"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === product.images.length - 1
                          ? 0
                          : current + 1,
                      )
                    }
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
              RIGHT SIDE - PRODUCT INFORMATION
          ====================================================== */}

          <div className="flex flex-col pt-1 lg:pt-2">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({length: 5}).map((_, index) => (
                  <Star
                    key={index}
                    className="h-[17px] w-[17px] fill-[#f5b51b] text-[#f5b51b]"
                    strokeWidth={1}
                  />
                ))}
              </div>

              <span className="text-[13px] font-semibold text-[#345225]">
                {product.rating}/5
              </span>
            </div>

            {/* Product title */}
            <div className="mt-1 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[25px] font-bold leading-[1.1] text-[#ad3d9f] sm:text-[29px] lg:text-[30px]">
                  {product.title}
                </h1>

                <p className="mt-1 text-[16px] text-stone-600">
                  {product.type}
                </p>
              </div>

              {/* Wishlist */}
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

            {/* Price */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-[25px] font-bold leading-none text-black">
                ₹{product.price}
              </span>

              <span className="text-[18px] text-[#e98b8b] line-through">
                ₹{product.originalPrice}
              </span>

              <span className="rounded-full bg-[#345225] px-3 py-1 text-[11px] font-medium text-[#ffdf9e]">
                {product.discount}% OFF
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 max-w-[650px] text-[11px] leading-[1.55] text-stone-500">
              {product.description}
            </p>

            <div className="my-3 border-b border-stone-300" />

            {/* =================================================
                COLORS
            ================================================== */}

            <div>
              <p className="mb-2 text-[12px] text-stone-600">
                Select Colors
              </p>

              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                    onClick={() =>
                      setSelectedColor(color.id)
                    }
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                      selectedColor === color.id
                        ? 'border border-[#345225]'
                        : 'border border-transparent'
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                SIZE
            ================================================== */}

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[12px] text-stone-600">
                  Choose Size
                </p>

                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] uppercase text-stone-600"
                >
                  <Ruler className="h-3 w-3" />
                  Size Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const isUnavailable =
                    size === 'XXL';

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`flex h-7 min-w-[42px] items-center justify-center rounded-full px-3 text-[10px] transition ${
                        isUnavailable
                          ? 'cursor-not-allowed bg-stone-400 text-stone-600'
                          : isSelected
                            ? 'bg-[#345225] text-white'
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                QUANTITY + ADD TO CART
            ================================================== */}

            <div className="mt-5 flex items-center gap-3">
              {/* Quantity */}
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

              {/* Add to cart */}
              <button
                type="button"
                className="h-8 flex-[2.5] rounded-full bg-[#ad3d9f] text-[11px] font-medium text-white transition hover:bg-[#96348a]"
              >
                Add to Cart
              </button>
            </div>

            {/* =================================================
                ACCORDIONS
            ================================================== */}

            <div className="mt-5 border-t border-[#6c655a]">
              {/* Fabric Details */}
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
                  Pure cotton-linen fabric with traditional
                  Lucknow Chikankari embroidery. Designed
                  with an oversized silhouette for a relaxed
                  fit.
                </div>
              )}

              {/* Wash Care */}
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
                  Gentle hand wash recommended. Wash
                  separately with mild detergent and dry in
                  shade.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}