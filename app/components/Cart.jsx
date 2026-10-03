import {Suspense, useEffect} from 'react';
import {
  Await,
  Link,
  NavLink,
  useRevalidator,
  useRouteLoaderData,
} from 'react-router';
import {CartForm, useOptimisticCart} from '@shopify/hydrogen';
import {Minus, Plus, X} from 'lucide-react';

const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const DURATION = 600;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function Cart({open, onClose}) {
  const rootData = useRouteLoaderData('root');
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!open) return undefined;

    if (revalidator.state === 'idle') {
      revalidator.revalidate();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, revalidator]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-black/35 transition-opacity duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Cart drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!open}
        className={`fixed right-0 top-0 bottom-0 z-[101] flex w-[min(480px,92vw)] max-w-full flex-col bg-white text-black font-['Swiss_721','Swiss','Helvetica_Neue',Helvetica,Arial,sans-serif] shadow-[-8px_0_30px_rgba(0,0,0,0.12)] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] max-sm:w-full ${
          open
            ? 'visible translate-x-0'
            : 'invisible translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-5 pt-[20px]">
          <h2
            className="m-0 font-light leading-none tracking-[-0.02em]"
            style={{fontSize: '30px'}}
          >
            My Cart
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="relative top-[-6px] flex h-10 w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <Suspense fallback={<EmptyCart />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <CartBody cart={cart} onClose={onClose} />}
          </Await>
        </Suspense>

        {/* Login / Proceed to Payment button */}
        <div className="shrink-0 px-[18px] py-3">
          <Suspense
            fallback={
              <div className="flex min-h-10 w-full items-center justify-center rounded-[6px] bg-[#345225] text-[12px] font-normal uppercase tracking-[0.02em] text-white">
                LOGIN
              </div>
            }
          >
            <Await resolve={rootData?.isLoggedIn}>
              {(isLoggedIn) =>
                isLoggedIn ? (
                  <NavLink
                    to="/checkout"
                    onClick={onClose}
                    style={{color: '#fff'}}
                    className="flex min-h-10 w-full items-center justify-center rounded-[6px] bg-[#345225] text-[12px] font-normal uppercase tracking-[0.02em] text-white no-underline"
                  >
                    CHECKOUT
                  </NavLink>
                ) : (
                  <NavLink
                    to="/account/login"
                    onClick={onClose}
                    style={{color: '#fff'}}
                    className="flex min-h-10 w-full items-center justify-center rounded-[6px] bg-[#345225] text-[12px] font-normal uppercase tracking-[0.02em] text-white no-underline"
                  >
                    LOGIN
                  </NavLink>
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </>
  );
}

function formatPrice(amount, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Number(amount))
    .replace(/\s/g, '');
}

function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      <h3 className="m-0 text-[21px] font-normal leading-[1.2]">
        Your Bag is Empty
      </h3>

      <p className="mt-[14px] text-[12px] font-normal leading-[1.4]">
        You haven't added anything to your bag yet.
      </p>
    </div>
  );
}

function CartBody({cart: originalCart, onClose}) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];

  if (!lines.length) {
    return <EmptyCart />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-5">
      <ul className="m-0 list-none p-0">
        {lines.map((line) => (
          <CartLineRow key={line.id} line={line} onClose={onClose} />
        ))}
      </ul>
    </div>
  );
}

function CartLineRow({line, onClose}) {
  const {id, quantity, merchandise, isOptimistic} = line;

  const options = merchandise?.selectedOptions ?? [];

  const size = options.find(
    (option) => option.name?.toLowerCase() === 'size',
  )?.value;

  const color = options.find(
    (option) => option.name?.toLowerCase() === 'color',
  )?.value;

  /* First PDP image saved on the line, falls back to variant image */
  const imageUrl =
    line.attributes?.find((attribute) => attribute.key === '_image')
      ?.value || merchandise?.image?.url;

  const currency = merchandise?.price?.currencyCode;

  const originalUnitPrice = Number(
    merchandise?.price?.amount || 0,
  );

  const discountPercentage = Number(
    line.attributes?.find(
      (attribute) =>
        attribute.key === '_discount_percentage',
    )?.value || 0,
  );

  const discountedUnitPrice =
    discountPercentage > 0
      ? Math.round(
          originalUnitPrice *
            (1 - discountPercentage / 100),
        )
      : originalUnitPrice;

  const hasDiscount =
    discountPercentage > 0 &&
    discountedUnitPrice < originalUnitPrice;

  const total = discountedUnitPrice * quantity;
  const totalCompareAt = originalUnitPrice * quantity;

  const productUrl = `/products/${merchandise?.product?.handle}?${new URLSearchParams(
    options.map((option) => [option.name, option.value]),
  )}`;

  return (
    <li className="flex gap-4 border-b border-stone-200 py-4">
      <Link
        to={productUrl}
        onClick={onClose}
        className="min-h-[110px] w-[88px] shrink-0 self-stretch overflow-hidden rounded-md bg-[#e8e0c8]"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={merchandise?.product?.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="m-0 text-[15px] font-bold leading-tight text-black">
            {merchandise?.product?.title}
          </p>

          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds: [id]}}
          >
            <button
              type="submit"
              disabled={!!isOptimistic}
              aria-label="Remove item"
              className="cursor-pointer border-0 bg-transparent p-0 text-black disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </CartForm>
        </div>

        {color ? (
          <p className="m-0 mt-1 text-[12px] text-stone-500">
            Color: {color}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-2">
          {size ? (
            <span className="rounded bg-[#f4f4f5] px-2.5 py-1 text-[12px] font-semibold text-black">
              Size: {size}
            </span>
          ) : null}

          <div className="flex items-center gap-2 rounded bg-[#f4f4f5] px-2 py-1 text-[12px] font-semibold text-black">
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{lines: [{id, quantity: Math.max(1, quantity - 1)}]}}
            >
              <button
                type="submit"
                disabled={quantity <= 1 || !!isOptimistic}
                aria-label="Decrease quantity"
                className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </CartForm>

            <span>Qty: {quantity}</span>

            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{lines: [{id, quantity: quantity + 1}]}}
            >
              <button
                type="submit"
                disabled={!!isOptimistic}
                aria-label="Increase quantity"
                className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-black disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </CartForm>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold text-black">
            {formatPrice(total, currency)}
          </span>

          {hasDiscount ? (
            <>
              <span className="text-[13px] text-stone-400 line-through">
                {formatPrice(totalCompareAt, currency)}
              </span>
              <span className="text-[13px] text-[#ff5c5c]">
                {formatPrice(totalCompareAt - total, currency)} OFF
              </span>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}