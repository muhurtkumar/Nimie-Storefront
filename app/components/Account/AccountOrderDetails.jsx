import {Link} from 'react-router';
import {ArrowLeft, Package, Truck} from 'lucide-react';

/* =========================================================
   HELPERS
========================================================= */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatMoney = (money) => {
  if (!money) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(money.amount));
};

const PAYMENT_BADGES = {
  PAID: {label: 'Paid', className: 'bg-[#e3efdc] text-[#2f5a1f]'},
  PENDING: {label: 'Payment pending', className: 'bg-[#f7ebcf] text-[#7a5a0c]'},
  AUTHORIZED: {label: 'Authorized', className: 'bg-[#f7ebcf] text-[#7a5a0c]'},
  REFUNDED: {label: 'Refunded', className: 'bg-[#eeeae5] text-[#55504a]'},
  PARTIALLY_REFUNDED: {
    label: 'Partially refunded',
    className: 'bg-[#eeeae5] text-[#55504a]',
  },
  VOIDED: {label: 'Cancelled', className: 'bg-[#f6dcd8] text-[#8a2c20]'},
};

const FULFILLMENT_BADGES = {
  SUCCESS: {label: 'Delivered', className: 'bg-[#e3efdc] text-[#2f5a1f]'},
  FULFILLED: {label: 'Delivered', className: 'bg-[#e3efdc] text-[#2f5a1f]'},
  IN_PROGRESS: {label: 'Shipped', className: 'bg-[#dde8f3] text-[#1f4a73]'},
  PARTIALLY_FULFILLED: {
    label: 'Partially shipped',
    className: 'bg-[#dde8f3] text-[#1f4a73]',
  },
  OPEN: {label: 'Processing', className: 'bg-[#eeeae5] text-[#55504a]'},
  PENDING: {label: 'Processing', className: 'bg-[#eeeae5] text-[#55504a]'},
  CANCELLED: {label: 'Cancelled', className: 'bg-[#f6dcd8] text-[#8a2c20]'},
};

const FALLBACK_BADGE = {
  label: 'Processing',
  className: 'bg-[#eeeae5] text-[#55504a]',
};

/* =========================================================
   MAIN COMPONENT
   Pass the `order` from the loader.
========================================================= */
export function AccountOrderDetails({order}) {
  const items = order.lineItems?.nodes ?? [];
  const itemCount = items.reduce((n, item) => n + (item.quantity ?? 1), 0);

  const fulfillment = order.fulfillments?.nodes?.[0];
  const fulfillmentKey = fulfillment?.status ?? order.fulfillmentStatus;
  const fulfillmentBadge = FULFILLMENT_BADGES[fulfillmentKey] ?? FALLBACK_BADGE;
  const paymentBadge = order.financialStatus
    ? (PAYMENT_BADGES[order.financialStatus] ?? FALLBACK_BADGE)
    : null;

  const trackingUrl = fulfillment?.trackingInformation?.[0]?.url ?? null;

  const discountTotal = items.reduce(
    (sum, item) => sum + Number(item.totalDiscount?.amount ?? 0),
    0,
  );
  const currencyCode = order.totalPrice?.currencyCode;
  const taxAmount = Number(order.totalTax?.amount ?? 0);

  const addressLines = order.shippingAddress?.formatted ?? [];

  return (
    <div className="min-w-0 w-full max-w-[760px]">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-[14px] text-[#55504a] transition-opacity hover:opacity-60"
      >
        <ArrowLeft size={16} strokeWidth={1.6} />
        Back to orders
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-serif text-[26px] leading-tight text-[#111111] md:text-[30px]">
            Order {order.name ?? `#${order.number}`}
          </h1>
          <p className="m-0 mt-1 text-[13px] text-[#7a746c]">
            Placed on {formatDate(order.processedAt)}
            {order.confirmationNumber
              ? ` · Confirmation ${order.confirmationNumber}`
              : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {paymentBadge && <Badge {...paymentBadge} />}
          <Badge {...fulfillmentBadge} />
        </div>
      </div>

      {/* Items */}
      <div
        role="region"
        aria-label="Items in this order"
        className="mt-6 rounded-[16px] border border-[#ebe7e1] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:p-6"
      >
        <h2 className="m-0 text-[16px] font-medium text-[#111111]">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </h2>

        <ul className="mt-4 divide-y divide-[#f0ece6]">
          {items.map((item, idx) => {
            const unit = Number(item.price?.amount ?? 0);
            const lineTotal =
              unit * (item.quantity ?? 1) -
              Number(item.totalDiscount?.amount ?? 0);
            return (
              <li
                key={`${item.title}-${item.variantTitle}-${idx}`}
                className="flex items-center gap-4 py-4"
              >
                <Thumb item={item} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-[#111111]">
                    {item.title}
                  </p>
                  {item.variantTitle && (
                    <p className="mt-0.5 text-[13px] text-[#7a746c]">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="mt-0.5 text-[13px] text-[#7a746c]">
                    Qty {item.quantity} × {formatMoney(item.price)}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] text-[#111111]">
                  {formatMoney({amount: lineTotal, currencyCode})}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Summary */}
        <div
          role="region"
          aria-label="Order summary"
          className="rounded-[16px] border border-[#ebe7e1] bg-white p-5 md:p-6"
        >
          <h2 className="m-0 text-[16px] font-medium text-[#111111]">Summary</h2>
          <dl className="mt-4 space-y-2 text-[14px] text-[#55504a]">
            <Row label="Subtotal" value={formatMoney(order.subtotal)} />
            {discountTotal > 0 && (
              <Row
                label="Discount"
                value={`− ${formatMoney({amount: discountTotal, currencyCode})}`}
              />
            )}
            <div className="flex justify-between border-t border-[#f0ece6] pt-3 text-[16px] font-medium text-[#111111]">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalPrice)}</dd>
            </div>
          </dl>
          {taxAmount > 0 && (
            <p className="mt-2 text-[12px] text-[#7a746c]">
              Includes {formatMoney(order.totalTax)} in taxes
            </p>
          )}
        </div>

        {/* Shipping address */}
        <div
          role="region"
          aria-label="Shipping address"
          className="rounded-[16px] border border-[#ebe7e1] bg-white p-5 md:p-6"
        >
          <h2 className="m-0 text-[16px] font-medium text-[#111111]">
            Shipping address
          </h2>
          {addressLines.length > 0 ? (
            <address className="mt-4 text-[14px] not-italic leading-6 text-[#55504a]">
              {addressLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : (
            <p className="mt-4 text-[14px] text-[#7a746c]">
              No shipping address on this order.
            </p>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="mt-6">
        <TrackButton url={trackingUrl} />
      </div>
    </div>
  );
}

/* =========================================================
   SMALL PIECES
========================================================= */
function TrackButton({url}) {
  const className =
    'inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#35522a] px-6 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35522a]';

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        <Truck size={17} strokeWidth={1.6} />
        Track your order
      </a>
    );
  }

  const handleTrack = () => {
    // TODO: open your custom tracking page / link here
  };

  return (
    <button type="button" onClick={handleTrack} className={className}>
      <Truck size={17} strokeWidth={1.6} />
      Track your order
    </button>
  );
}

function Row({label, value}) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Badge({label, className}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function Thumb({item}) {
  if (item.image?.url) {
    return (
      <img
        src={item.image.url}
        alt={item.image.altText || item.title}
        loading="lazy"
        className="h-[72px] w-[72px] shrink-0 rounded-[10px] bg-[#f5f2ee] object-cover"
      />
    );
  }
  return (
    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[10px] bg-[#f5f2ee] text-[#a39d94]">
      <Package size={24} strokeWidth={1.4} />
    </div>
  );
}
