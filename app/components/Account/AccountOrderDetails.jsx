import {useEffect, useState} from 'react';
import {Link, useFetcher} from 'react-router';
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
export function AccountOrderDetails({
  order,
  cancelledItems = [],
}) {
  const cancelFetcher = useFetcher();
  const returnFetcher = useFetcher();

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedItemToCancel, setSelectedItemToCancel] = useState(null);
  const [cancelledItemIds, setCancelledItemIds] = useState([]);

  const [selectedItemToReturn, setSelectedItemToReturn] = useState(null);
  const [returnedItemIds, setReturnedItemIds] = useState([]);
  const [returnReason, setReturnReason] = useState('Damaged item');
  const [returnDescription, setReturnDescription] = useState('');

  useEffect(() => {
    if (
      cancelFetcher.data?.success &&
      cancelFetcher.data?.type === 'item-cancelled' &&
      cancelFetcher.data?.lineItemId
    ) {
      setCancelledItemIds((previousIds) =>
        previousIds.includes(cancelFetcher.data.lineItemId)
          ? previousIds
          : [...previousIds, cancelFetcher.data.lineItemId],
      );
    }
  }, [cancelFetcher.data]);

  useEffect(() => {
    if (
      returnFetcher.data?.success &&
      returnFetcher.data?.type === 'return-request' &&
      returnFetcher.data?.lineItemId
    ) {
      setReturnedItemIds((previousIds) =>
        previousIds.includes(returnFetcher.data.lineItemId)
          ? previousIds
          : [...previousIds, returnFetcher.data.lineItemId],
      );

      setSelectedItemToReturn(null);
    }
  }, [returnFetcher.data]);

  const activeItems = order.lineItems?.nodes ?? [];

  const cancelledIds = new Set(
    cancelledItems.map((item) => item.lineItemId),
  );

  const fulfillment = order.fulfillments?.nodes?.[0];

  const isOrderDelivered =
    fulfillment?.status === 'SUCCESS' ||
    fulfillment?.status === 'DELIVERED';

  const items = [
    ...activeItems.map((item) => ({
      ...item,
      isDelivered: isOrderDelivered,
    })),
    ...cancelledItems
      .filter(
        (cancelledItem) =>
          !activeItems.some(
            (activeItem) =>
              activeItem.id === cancelledItem.lineItemId,
          ),
      )
      .map((item) => ({
        ...item,
        id: item.lineItemId,
        isCancelled: true,
        isDelivered: false,
      })),
  ];

  const isCancelling = cancelFetcher.state !== 'idle';
  const isItemCancellation =
    cancelFetcher.formData?.get('intent') === 'cancel-item';
  const itemCount = items.reduce((n, item) => n + (item.quantity ?? 1), 0);

  const fulfillment = order.fulfillments?.nodes?.[0];

  const fulfillmentBadge = order.cancelledAt
    ? FULFILLMENT_BADGES.CANCELLED
    : FULFILLMENT_BADGES[fulfillmentKey] ?? FALLBACK_BADGE;
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
          <h1
            className="m-0 font-serif text-[26px] leading-tight text-[#111111] md:text-[30px]"
            style={{margin: 0}}
          >
            Order {order.name ?? `#${order.number}`}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {paymentBadge && <Badge {...paymentBadge} />}
          <Badge {...fulfillmentBadge} />
        </div>
      </div>

      {/* Placed on + item count */}
      <div
        className="flex items-center justify-between gap-3"
        style={{marginTop: '16px'}}
      >
        <p className="m-0 min-w-0 text-[13px] text-[#7a746c]">
          Placed on {formatDate(order.processedAt)}
          {order.processedAt &&
            ` · ${new Date(order.processedAt).toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Kolkata',
            })}`}
        </p>
        <p
          className="m-0 hidden shrink-0 text-[13px] text-[#7a746c] md:block"
          style={{paddingRight: '10px'}}
        >
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Items */}
      <div
        role="region"
        aria-label="Items in this order"
        className="mt-6 rounded-[16px] border border-[#ebe7e1] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:p-6"
      >
        <h2 className="m-0 text-[16px] font-medium text-[#111111] md:hidden">
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
                  <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                    <div>
                      <p className="text-[15px] font-medium text-[#111111]">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="mt-0.5 text-[13px] text-[#7a746c]">
                          {item.variantTitle}
                        </p>
                      )}
                    </div>
                    <p className="text-[13px] text-[#7a746c]">
                      Qty {item.quantity} × {formatMoney(item.price)}
                    </p>
                  </div>
                <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                  <p className="text-[15px] text-[#111111]">
                    {formatMoney({amount: lineTotal, currencyCode})}
                  </p>

                  {!order.cancelledAt &&
                    (item.isCancelled ||
                    cancelledIds.has(item.id) ||
                    cancelledItemIds.includes(item.id) ||
                    returnedItemIds.includes(item.id) ? (
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                          returnedItemIds.includes(item.id)
                            ? 'bg-[#dde8f3] text-[#1f4a73]'
                            : 'bg-[#f6dcd8] text-[#8a2c20]'
                        }`}
                      >
                        {returnedItemIds.includes(item.id)
                          ? 'Return Initiated'
                          : 'Cancelled'}
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedItemToCancel(item)}
                        disabled={isCancelling || !item.id}
                        className="cursor-pointer text-[13px] font-medium text-[#8a2c20] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling &&
                        cancelFetcher.formData?.get('lineItemId') === item.id
                          ? 'Cancelling...'
                          : 'Cancel item'}
                      </button>

                      {item.isDelivered && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItemToReturn(item);
                            setReturnReason('Damaged item');
                            setReturnDescription('');
                          }}
                          disabled={!item.id}
                          className="cursor-pointer text-[13px] font-medium text-[#35522a] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Return item
                        </button>
                      )}
                    </div>
                    ))}
                </div>
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

      {/* Order actions */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {!order.cancelledAt && (
          <>
            <TrackButton url={trackingUrl} />

            <button
              type="button"
              onClick={() => {
                setSelectedItemToCancel(null);
                setShowCancelConfirmation(true);
              }}
              disabled={isCancelling}
              className="inline-flex items-center justify-center rounded-full border border-[#c8b9ad] px-4 py-2.5 text-[13px] sm:px-6 sm:py-3 sm:text-[14px] font-medium text-[#6b3029] transition-colors hover:bg-[#f8f1ee] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Cancel full Order
            </button>
          </>
        )}
      </div>

      {/* Cancellation success message */}
      {cancelFetcher.data?.success && (
        <div
          role="status"
          className="mt-4 rounded-xl bg-[#e3efdc] p-4 text-[14px] text-[#2f5a1f]"
        >
          {cancelFetcher.data.message}
        </div>
      )}

      {/* Return request success message */}
      {returnFetcher.data?.success &&
        returnFetcher.data?.type === 'return-request' && (
          <div
            role="status"
            className="mt-4 rounded-xl bg-[#e3efdc] p-4 text-[14px] text-[#2f5a1f]"
          >
            {returnFetcher.data.message}
          </div>
        )}

      {/* Cancellation error message */}
      {cancelFetcher.data?.error && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-[#f6dcd8] p-4 text-[14px] text-[#8a2c20]"
        >
          {cancelFetcher.data.error}
        </div>
      )}

      {/* Cancellation confirmation dialog */}
      {(showCancelConfirmation || selectedItemToCancel) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="cancel-order-title"
              className="m-0 font-serif text-[24px] text-[#111111]"
            >
              {selectedItemToCancel
                ? 'Cancel this item?'
                : 'Cancel this order?'}
            </h2>

            <p className="mt-3 text-[14px] leading-6 text-[#55504a]">
              {selectedItemToCancel ? (
                <>
                  Do you want to request cancellation of{' '}
                  <strong>{selectedItemToCancel.title}</strong>
                  {selectedItemToCancel.variantTitle
                    ? ` (${selectedItemToCancel.variantTitle})`
                    : ''}
                  ? Other items in your order will remain unchanged.
                </>
              ) : (
                <>
                  If Nimie accepts the cancellation, eligible payments will
                  be refunded to your Nimie Wallet. This action cannot be undone.
                </>
              )}
            </p>

            <p className="mt-3 text-[12px] leading-5 text-[#7a746c]">
              Cancellation is subject to order status and eligibility.
              Any applicable refund must be processed separately for an
              individual item.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirmation(false);
                  setSelectedItemToCancel(null);
                }}
                disabled={isCancelling}
                className="inline-flex items-center justify-center rounded-full border border-[#8a2c20] bg-[#8a2c20] px-5 py-2.5 text-[14px] font-medium leading-5 text-white transition-colors hover:bg-[#74241b] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Do not Cancel
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={() => {
                  if (selectedItemToCancel) {
                    cancelFetcher.submit(
                      {
                        intent: 'cancel-item',
                        lineItemId: selectedItemToCancel.id,
                      },
                      {
                        method: 'post',
                        encType: 'application/x-www-form-urlencoded',
                      },
                    );

                    setSelectedItemToCancel(null);
                  } else {
                    cancelFetcher.submit(
                      {
                        intent: 'cancel-order',
                      },
                      {
                        method: 'post',
                        encType: 'application/x-www-form-urlencoded',
                      },
                    );

                    setShowCancelConfirmation(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#ebe7e1] bg-white px-5 py-2.5 text-[14px] font-medium leading-5 text-[#55504a] transition-colors hover:bg-[#f8f6f3] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isCancelling
                  ? 'Submitting...'
                  : 'Confirm cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return item dialog */}
      {selectedItemToReturn && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-item-title"
            className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="return-item-title"
              className="m-0 font-serif text-[24px] text-[#111111]"
            >
              Request a return
            </h2>

            <p className="mt-3 text-[14px] leading-6 text-[#55504a]">
              Submit a return request for{' '}
              <strong>{selectedItemToReturn.title}</strong>
              {selectedItemToReturn.variantTitle
                ? ` (${selectedItemToReturn.variantTitle})`
                : ''}
              . Your request will be reviewed by Nimie.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                returnFetcher.submit(
                  {
                    intent: 'return-request',
                    lineItemId: selectedItemToReturn.id,
                    reason: returnReason,
                    description: returnDescription,
                    quantity: String(selectedItemToReturn.quantity ?? 1),
                  },
                  {
                    method: 'post',
                    encType: 'application/x-www-form-urlencoded',
                  },
                );
              }}
            >
              <div>
                <label
                  htmlFor="return-reason"
                  className="mb-1.5 block text-[13px] font-medium text-[#333333]"
                >
                  Reason for return
                </label>

                <select
                  id="return-reason"
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  className="w-full rounded-lg border border-[#ebe7e1] bg-white px-3 py-2.5 text-[14px] text-[#333333] outline-none focus:border-[#35522a]"
                >
                  <option value="Damaged item">Damaged item</option>
                  <option value="Defective item">Defective item</option>
                  <option value="Missing item">Missing item</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="return-description"
                  className="mb-1.5 block text-[13px] font-medium text-[#333333]"
                >
                  Additional details
                </label>

                <textarea
                  id="return-description"
                  value={returnDescription}
                  onChange={(event) => setReturnDescription(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe the issue with your item..."
                  className="w-full resize-y rounded-lg border border-[#ebe7e1] px-3 py-2.5 text-[14px] text-[#333333] outline-none placeholder:text-[#a39d94] focus:border-[#35522a]"
                />
              </div>

              {returnFetcher.data?.error && (
                <p role="alert" className="text-[13px] text-[#8a2c20]">
                  {returnFetcher.data.error}
                </p>
              )}

              <p className="text-[12px] leading-5 text-[#7a746c]">
                Submitting this form requests a return; it does not automatically
                approve the return, issue a refund, or arrange a pickup.
              </p>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemToReturn(null)}
                  disabled={returnFetcher.state !== 'idle'}
                  className="inline-flex items-center justify-center rounded-full border border-[#ebe7e1] bg-white px-5 py-2.5 text-[14px] font-medium leading-5 text-[#55504a] hover:bg-[#f8f6f3] disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={returnFetcher.state !== 'idle'}
                  className="inline-flex items-center justify-center rounded-full bg-[#35522a] px-5 py-2.5 text-[14px] font-medium leading-5 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {returnFetcher.state !== 'idle'
                    ? 'Submitting...'
                    : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        );
      }

/* =========================================================
   SMALL PIECES
========================================================= */

function TrackButton({url}) {
  const className =
    'inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#35522a] px-4 py-2.5 text-[13px] sm:px-6 sm:py-3 sm:text-[14px] font-medium !text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35522a]';

  return (
    <a
      href="https://nimie.shiprocket.co/tracking"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <Truck size={17} strokeWidth={1.6} />
      Track your Order
    </a>
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
        className="h-[96px] w-[72px] shrink-0 rounded-[10px] bg-[#f5f2ee] object-cover"
      />
    );
  }
  return (
    <div className="flex h-[96px] w-[72px] shrink-0 items-center justify-center rounded-[10px] bg-[#f5f2ee] text-[#a39d94]">
      <Package size={24} strokeWidth={1.4} />
    </div>
  );
}
