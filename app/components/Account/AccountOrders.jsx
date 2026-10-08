import {useState} from 'react';
import {Link} from 'react-router';
import {Package, ChevronRight, Truck} from 'lucide-react';

const PAGE_SIZE = 3;

/* =========================================================
   MOCK DATA (delete this block once real orders are wired)
   Shape matches Shopify Customer Account API order nodes.
========================================================= */
const MOCK_ORDERS = Array.from({length: 8}, (_, i) => ({
  id: `gid://shopify/Order/${1000 + i}`,
  number: 1001 + i,
  processedAt: new Date(Date.UTC(2026, 8, 28 - i * 4)).toISOString(),
  financialStatus: i === 1 ? 'PENDING' : i === 6 ? 'REFUNDED' : 'PAID',
  fulfillments: {
    nodes: [{status: i === 0 ? 'IN_PROGRESS' : i === 1 ? 'OPEN' : 'SUCCESS'}],
  },
  currentTotalPrice: {amount: String(1299 + i * 450), currencyCode: 'INR'},
  lineItems: {
    nodes: Array.from({length: (i % 4) + 1}, (_, j) => ({
      title: `Sample product ${j + 1}`,
      image: null, // real orders: {url, altText}
    })),
  },
}));

/* =========================================================
   HELPERS
========================================================= */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC', // avoids server/client hydration mismatch
  });

const formatMoney = ({amount, currencyCode}) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));

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
   Pass real orders as `orders` (array of order nodes).
========================================================= */
export function AccountOrders({orders = MOCK_ORDERS}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleOrders = orders.slice(0, visibleCount);
  const remaining = orders.length - visibleCount;

  return (
    <div className="min-w-0 flex-1 px-2 py-4 md:px-8 md:py-8">
      <h1 className="font-serif text-[26px] text-[#111111] md:text-[30px]">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <>
          <ul className="mt-6 flex max-w-[760px] flex-col gap-4">
            {visibleOrders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>

          {remaining > 0 && (
            <div className="mt-6 max-w-[760px] text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="cursor-pointer rounded-full border border-[#35522a] px-8 py-3 text-[14px] font-medium text-[#35522a] transition-colors hover:bg-[#35522a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35522a]"
              >
                Load more orders
              </button>
              <p className="mt-2 text-[12px] text-[#7a746c]" aria-live="polite">
                Showing {visibleOrders.length} of {orders.length}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   ORDER CARD
========================================================= */
function OrderCard({order}) {
  const items = order.lineItems?.nodes ?? [];
  const shownItems = items.slice(0, 3);
  const extraItems = items.length - shownItems.length;

  const payment = PAYMENT_BADGES[order.financialStatus] ?? FALLBACK_BADGE;
  const fulfillmentStatus = order.fulfillments?.nodes?.[0]?.status;
  const fulfillment = FULFILLMENT_BADGES[fulfillmentStatus] ?? FALLBACK_BADGE;

  const total = order.currentTotalPrice ?? order.totalPrice;

  // Later: set this from fulfillment tracking info, e.g.
  // order.fulfillments.nodes[0].trackingInformation[0]?.url
  const trackingUrl = null;

  return (
    <article className="rounded-[16px] border border-[#ebe7e1] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:p-6">
      {/* Top row: number, date, status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-medium text-[#111111]">
            Order #{order.number}
          </h2>
          <p className="mt-0.5 text-[13px] text-[#7a746c]">
            Placed on {formatDate(order.processedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge {...payment} />
          <Badge {...fulfillment} />
        </div>
      </div>

      {/* Items */}
      <div className="mt-5 flex items-center gap-3 border-t border-[#f0ece6] pt-5">
        {shownItems.map((item, idx) => (
          <Thumb key={`${item.title}-${idx}`} item={item} />
        ))}
        {extraItems > 0 && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f2ee] text-[13px] text-[#55504a]">
            +{extraItems}
          </div>
        )}
        <p className="ml-1 text-[13px] text-[#55504a]">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Bottom row: total + actions */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] text-[#7a746c]">Total</p>
          <p className="text-[18px] font-medium text-[#111111]">
            {total ? formatMoney(total) : '—'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="inline-flex items-center gap-1 rounded-full border border-[#d9d4cc] px-5 py-2.5 text-[14px] text-[#2d2a27] transition-colors hover:bg-[#f1eeea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35522a]"
          >
            View details
            <ChevronRight size={16} strokeWidth={1.5} />
          </Link>

          <TrackButton url={trackingUrl} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   TRACK BUTTON
   Visible now. Add your tracking logic in handleTrack later.
========================================================= */
function TrackButton({url}) {
  const className =
    'inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#35522a] px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35522a]';

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        <Truck size={17} strokeWidth={1.6} />
        Track your order
      </a>
    );
  }

  const handleTrack = () => {
    // TODO: open your custom tracking page / tracking link here
  };

  return (
    <button type="button" onClick={handleTrack} className={className}>
      <Truck size={17} strokeWidth={1.6} />
      Track your order
    </button>
  );
}

/* =========================================================
   SMALL PIECES
========================================================= */
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
        className="h-14 w-14 shrink-0 rounded-[10px] bg-[#f5f2ee] object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f2ee] text-[#a39d94]"
      title={item.title}
    >
      <Package size={22} strokeWidth={1.4} />
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="mt-8 max-w-[760px] rounded-[16px] border border-[#ebe7e1] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeae5] text-[#55504a]">
        <Package size={26} strokeWidth={1.4} />
      </div>
      <p className="mt-4 text-[16px] text-[#111111]">
        You haven&apos;t placed any orders yet.
      </p>
      <p className="mt-1 text-[14px] text-[#7a746c]">
        Your orders will appear here once you check out.
      </p>
      <Link
        to="/collections/all"
        className="mt-6 inline-block rounded-full bg-[#35522a] px-8 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Start shopping
      </Link>
    </div>
  );
}