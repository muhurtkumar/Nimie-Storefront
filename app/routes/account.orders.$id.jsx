import {redirect, useLoaderData, data} from 'react-router';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {AccountOrderDetails} from '~/components/Account/AccountOrderDetails';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Nimie | Order ${data?.order?.name}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const order = data.order;
  const {env} = context;

  const shop = env.SHOPIFY_SHOP;
  const clientId = env.SHOPIFY_API_KEY;
  const clientSecret = env.SHOPIFY_API_SECRET;

  let cancelledItems = [];

  if (shop && clientId && clientSecret) {
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok && tokenData.access_token) {
      const metafieldResponse = await fetch(
        `https://${shop}/admin/api/2026-10/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': tokenData.access_token,
          },
          body: JSON.stringify({
            query: `
              query GetCancelledItems($id: ID!) {
                order(id: $id) {
                  id
                  metafield(
                    namespace: "custom"
                    key: "cancelled_items"
                  ) {
                    value
                  }
                }
              }
            `,
            variables: {
              id: order.id,
            },
          }),
        },
      );

      const metafieldResult = await metafieldResponse.json();

      if (
        metafieldResponse.ok &&
        !metafieldResult.errors?.length
      ) {
        const value =
          metafieldResult.data?.order?.metafield?.value;

        if (value) {
          try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
              cancelledItems = parsed;
            }
          } catch (error) {
            console.error(
              'Could not parse cancelled-items metafield:',
              error,
            );
          }
        }
      } else {
        console.error(
          'Could not read cancelled-items metafield:',
          JSON.stringify(metafieldResult.errors ?? []),
        );
      }
    }
  }

  return {
    order,
    cancelledItems,
  };
}

export async function action({request, params, context}) {
  const {customerAccount, env} = context;

  if (request.method !== 'POST') {
    return data(
      {success: false, error: 'Method not allowed.'},
      {status: 405},
    );
  }

  if (!params.id) {
    return data(
      {success: false, error: 'Order not found.'},
      {status: 404},
    );
  }

  const formData = await request.formData();
  const intent = formData.get('intent') || 'cancel-order';
  const lineItemId = formData.get('lineItemId');

  async function adminGraphQL(shop, adminHeaders, query, variables) {
    const response = await fetch(
      `https://${shop}/admin/api/2026-10/graphql.json`,
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({query, variables}),
      },
    );

    const result = await response.json();

    if (!response.ok || result.errors?.length) {
      throw new Error(
        result.errors?.map((error) => error.message).join(', ') ||
          'Shopify Admin API request failed.',
      );
    }

    return result.data;
  }

  if (!['cancel-order', 'cancel-item'].includes(intent)) {
    return data(
      {success: false, error: 'Invalid cancellation action.'},
      {status: 400},
    );
  }

  try {
    // Verify the order is accessible to the authenticated customer.
    const orderId = atob(params.id);

    const {data: customerData, errors} =
      await customerAccount.query(CUSTOMER_ORDER_QUERY, {
        variables: {
          orderId,
          language: customerAccount.i18n.language,
        },
      });

    if (errors?.length || !customerData?.order) {
      return data(
        {success: false, error: 'Order not found.'},
        {status: 404},
      );
    }

    const customerOrder = customerData.order;

    // Never cancel an order that is already cancelled.
    if (customerOrder.cancelledAt) {
      return data(
        {success: false, error: 'This order has already been cancelled.'},
        {status: 400},
      );
    }

    // Obtain an Admin API access token.
    const shop = env.SHOPIFY_SHOP;
    const clientId = env.SHOPIFY_API_KEY;
    const clientSecret = env.SHOPIFY_API_SECRET;

    if (!shop || !clientId || !clientSecret) {
      console.error('Shopify Admin API environment variables are missing.');

      return data(
        {success: false, error: 'Cancellation is temporarily unavailable.'},
        {status: 500},
      );
    }

    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    console.log('Granted Shopify API scopes:', tokenData.scope);

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Shopify token request failed.');

      return data(
        {success: false, error: 'Cancellation is temporarily unavailable.'},
        {status: 502},
      );
    }

    const adminHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': tokenData.access_token,
    };

    // Recheck the authoritative order status through the Admin API.
    const verifyResponse = await fetch(
      `https://${shop}/admin/api/2026-10/graphql.json`,
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          query: `
            query VerifyOrderForCancellation($id: ID!) {
              order(id: $id) {
                id
                cancelledAt
                displayFulfillmentStatus
                displayFinancialStatus
              }
            }
          `,
          variables: {id: customerOrder.id},
        }),
      },
    );

    const verifyResult = await verifyResponse.json();
    const verifiedOrder = verifyResult.data?.order;

    if (!verifyResponse.ok || verifyResult.errors?.length || !verifiedOrder) {
      console.error('Could not verify the order through Shopify Admin API.');

      return data(
        {success: false, error: 'Could not verify this order.'},
        {status: 502},
      );
    }

        if (verifiedOrder.cancelledAt) {
      return data(
        {success: false, error: 'This order has already been cancelled.'},
        {status: 400},
      );
    }

    if (intent === 'cancel-item') {
      if (typeof lineItemId !== 'string' || !lineItemId) {
        return data(
          {
            success: false,
            error: 'Please select a valid item to cancel.',
          },
          {status: 400},
        );
      }

      // Verify that the item belongs to this customer's order.
      const customerLineItems = customerOrder.lineItems?.nodes ?? [];

      const selectedItem = customerLineItems.find(
        (item) => item.id === lineItemId,
      );

      if (!selectedItem) {
        return data(
          {
            success: false,
            error: 'This item does not belong to your order.',
          },
          {status: 400},
        );
      }

      // Only allow cancellation for completely unfulfilled orders.
      if (verifiedOrder.displayFulfillmentStatus !== 'UNFULFILLED') {
        return data(
          {
            success: false,
            error:
              'This order may already be shipped or partially fulfilled. Please contact Nimie support.',
          },
          {status: 400},
        );
      }

      // Only issue a wallet refund for paid orders.
      if (
        !['PAID', 'PARTIALLY_REFUNDED'].includes(
          verifiedOrder.displayFinancialStatus,
        )
      ) {
        return data(
          {
            success: false,
            error:
              'This order is not fully paid. Please contact Nimie support to cancel this item.',
          },
          {status: 400},
        );
      }

      // Read previously cancelled items before processing a new refund.
      const existingData = await adminGraphQL(
        shop,
        adminHeaders,
        `
          query GetCancelledItemsBeforeRefund($id: ID!) {
            order(id: $id) {
              id
              metafield(
                namespace: "custom"
                key: "cancelled_items"
              ) {
                value
              }
            }
          }
        `,
        {id: customerOrder.id},
      );

      const existingValue = existingData.order?.metafield?.value;
      let savedItems = [];

      if (existingValue) {
        try {
          const parsed = JSON.parse(existingValue);

          if (Array.isArray(parsed)) {
            savedItems = parsed;
          }
        } catch {
          return data(
            {
              success: false,
              error:
                'The cancellation history could not be read. Please contact Nimie support.',
            },
            {status: 500},
          );
        }
      }

      // Prevent refunding an item that was already cancelled.
      if (savedItems.some((item) => item.lineItemId === selectedItem.id)) {
        return data(
          {
            success: false,
            error: 'This item has already been cancelled.',
          },
          {status: 400},
        );
      }

      // Retrieve Shopify's authoritative line-item totals.
      const orderAmounts = await adminGraphQL(
        shop,
        adminHeaders,
        `
          query GetItemRefundAmount($orderId: ID!) {
            order(id: $orderId) {
              id
              lineItems(first: 100) {
                nodes {
                  id
                  quantity
                  discountedTotalSet {
                    presentmentMoney {
                      amount
                      currencyCode
                    }
                  }
                  taxLines {
                    priceSet {
                      presentmentMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        {orderId: customerOrder.id},
      );

      const adminLineItem = (
        orderAmounts.order?.lineItems?.nodes ?? []
      ).find((item) => item.id === selectedItem.id);

      if (
        !adminLineItem ||
        adminLineItem.quantity < selectedItem.quantity
      ) {
        return data(
          {
            success: false,
            error:
              'The item quantity could not be verified. Please refresh and try again.',
          },
          {status: 409},
        );
      }

      const money =
        adminLineItem.discountedTotalSet?.presentmentMoney;

      if (!money?.amount || !money?.currencyCode) {
        return data(
          {
            success: false,
            error:
              'Could not calculate the refundable amount for this item.',
          },
          {status: 502},
        );
      }

      // Include the discounted item total and its applicable line-item taxes.
      const taxLines = adminLineItem.taxLines ?? [];

      const taxCurrencyMismatch = taxLines.some(
        (tax) =>
          tax.priceSet?.presentmentMoney?.currencyCode &&
          tax.priceSet.presentmentMoney.currencyCode !== money.currencyCode,
      );

      if (taxCurrencyMismatch) {
        return data(
          {
            success: false,
            error:
              'The item refund currency could not be verified.',
          },
          {status: 502},
        );
      }

      const taxAmount = taxLines.reduce(
        (total, tax) =>
          total +
          Number(tax.priceSet?.presentmentMoney?.amount ?? 0),
        0,
      );

      const refundAmount = (
        Number(money.amount) + taxAmount
      ).toFixed(2);

      if (!Number.isFinite(Number(refundAmount)) || Number(refundAmount) <= 0) {
        return data(
          {
            success: false,
            error:
              'The refundable amount is invalid. Please contact Nimie support.',
          },
          {status: 400},
        );
      }

      // Retrieve an active Shopify inventory location for restocking.
      const locationsData = await adminGraphQL(
        shop,
        adminHeaders,
        `#graphql
          query GetActiveLocations {
            locations(first: 50, query: "isActive:true") {
              nodes {
                id
                name
                isActive
              }
            }
          }
        `,
        {},
      );

      const restockLocationId =
        locationsData.locations.nodes.find((location) => location.isActive)?.id;

      if (!restockLocationId) {
        return data(
          {
            success: false,
            error:
              'No active inventory location was found. Please contact Nimie support.',
          },
          {status: 502},
        );
      }

      // Generate a stable UUID-shaped idempotency key for this order/item.
      // A retry uses the same key instead of creating a second refund.
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(
          `nimie-item-refund:${customerOrder.id}:${selectedItem.id}`,
        ),
      );

      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

      const idempotencyKey =
        `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-5${hashHex.slice(13, 16)}-a${hashHex.slice(17, 20)}-${hashHex.slice(20, 32)}`;

      // Refund the item to Shopify Store Credit (Nimie Wallet).
      // Restocking is requested as part of the refund operation.
      const refundResult = await adminGraphQL(
        shop,
        adminHeaders,
        `
          mutation RefundCancelledItem($input: RefundInput!) {
            refundCreate(input: $input)
              @idempotent(key: "${idempotencyKey}") {
              refund {
                id
                totalRefundedSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                transactions(first: 5) {
                  nodes {
                    gateway
                    kind
                    status
                    amountSet {
                      presentmentMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          input: {
            orderId: customerOrder.id,
            refundLineItems: [
              {
                lineItemId: selectedItem.id,
                quantity: selectedItem.quantity,
                restockType: 'CANCEL',
                locationId: restockLocationId,
              },
            ],
            transactions: [],
            refundMethods: [
              {
                storeCreditRefund: {
                  amount: {
                    amount: refundAmount,
                    currencyCode: money.currencyCode,
                  },
                },
              },
            ],
            notify: true,
            note:
              'Customer requested an individual-item cancellation through the Nimie storefront.',
          },
        },
      );

      const refundPayload = refundResult.refundCreate;

      if (
        refundPayload?.userErrors?.length ||
        !refundPayload?.refund
      ) {
        console.error(
          'Shopify item refund failed:',
          JSON.stringify(refundPayload?.userErrors ?? []),
        );

        return data(
          {
            success: false,
            error:
              refundPayload?.userErrors
                ?.map((error) => error.message)
                .join(' ') ||
              'Shopify could not process the item refund.',
          },
          {status: 502},
        );
      }

      // Confirm Shopify created the refund for the expected amount.
      const actualRefund =
        refundPayload.refund.totalRefundedSet?.presentmentMoney;

      if (
        !actualRefund ||
        actualRefund.currencyCode !== money.currencyCode ||
        Math.abs(
          Number(actualRefund.amount) - Number(refundAmount),
        ) > 0.01
      ) {
        console.error('Unexpected Shopify refund amount:', {
          expected: refundAmount,
          actual: actualRefund,
        });

        return data(
          {
            success: false,
            error:
              'Shopify created a refund, but its amount could not be confirmed. Please contact Nimie support before retrying.',
          },
          {status: 502},
        );
      }

      // Persist the cancelled item only after Shopify confirms the refund.
      savedItems.push({
        lineItemId: selectedItem.id,
        title: selectedItem.title,
        variantTitle: selectedItem.variantTitle,
        quantity: selectedItem.quantity,
        price: selectedItem.price,
        totalDiscount: selectedItem.totalDiscount,
        image: selectedItem.image,
        refundId: refundPayload.refund.id,
        refundAmount,
        refundCurrency: money.currencyCode,
        cancelledAt: new Date().toISOString(),
      });

      const saveResult = await adminGraphQL(
        shop,
        adminHeaders,
        `
          mutation SaveCancelledItems(
            $metafields: [MetafieldsSetInput!]!
          ) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                namespace
                key
                value
              }
              userErrors {
                field
                message
                code
              }
            }
          }
        `,
        {
          metafields: [
            {
              ownerId: customerOrder.id,
              namespace: 'custom',
              key: 'cancelled_items',
              type: 'json',
              value: JSON.stringify(savedItems),
            },
          ],
        },
      );

      const savePayload = saveResult.metafieldsSet;

      if (
        savePayload?.userErrors?.length ||
        !savePayload?.metafields?.length
      ) {
        console.error(
          'Refund succeeded, but cancellation history could not be saved:',
          JSON.stringify(savePayload?.userErrors ?? []),
        );

        return data(
          {
            success: true,
            type: 'item-cancelled',
            lineItemId,
            persistenceError: true,
            refundAmount,
            refundCurrency: money.currencyCode,
            message:
              'The item refund was processed, but its cancellation status could not be saved. Please contact Nimie support before retrying.',
          },
        );
      }

      return data({
        success: true,
        type: 'item-cancelled',
        lineItemId,
        refundAmount,
        refundCurrency: money.currencyCode,
        message:
          `The item was cancelled and a refund of ${money.currencyCode} ${refundAmount} was issued to your Nimie Wallet.`,
      });
    }

    // Do not automatically cancel orders already fulfilled or shipped.
    if (verifiedOrder.displayFulfillmentStatus !== 'UNFULFILLED') {
      return data(
        {
          success: false,
          error:
            'This order may already be shipped or partially fulfilled. Please contact Nimie support to request cancellation.',
        },
        {status: 400},
      );
    }

    // Decide whether the order should receive a Store Credit refund.
    const isPaidOrder =
      verifiedOrder.displayFinancialStatus === 'PAID';

    const refundMethod = isPaidOrder
      ? {
          storeCreditRefund: {},
        }
      : {
          originalPaymentMethodsRefund: false,
        };

    // Cancel the order using the appropriate refund method.
    const cancelResponse = await fetch(
      `https://${shop}/admin/api/2026-10/graphql.json`,
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          query: `
            mutation CancelOrderToStoreCredit(
              $orderId: ID!
              $refundMethod: OrderCancelRefundMethodInput!
              $restock: Boolean!
              $reason: OrderCancelReason!
              $notifyCustomer: Boolean!
            ) {
              orderCancel(
                orderId: $orderId
                refundMethod: $refundMethod
                restock: $restock
                reason: $reason
                notifyCustomer: $notifyCustomer
              ) {
                job {
                  id
                  done
                }
                orderCancelUserErrors {
                  field
                  message
                  code
                }
              }
            }
          `,
          variables: {
            orderId: verifiedOrder.id,
            refundMethod,
            restock: true,
            reason: 'CUSTOMER',
            notifyCustomer: true,
          },
        }),
      },
    );

    const cancelResult = await cancelResponse.json();
    const cancelPayload = cancelResult.data?.orderCancel;
    console.log(
      'Shopify orderCancel response:',
      JSON.stringify(cancelResult, null, 2),
    );

    if (!cancelResponse.ok || cancelResult.errors?.length) {
      console.error(
        'Shopify cancellation API request failed:',
        JSON.stringify(cancelResult.errors ?? []),
      );

      return data(
        {success: false, error: 'Shopify could not process this cancellation.'},
        {status: 502},
      );
    }

    const cancellationErrors = cancelPayload?.orderCancelUserErrors ?? [];

    if (cancellationErrors.length) {
      return data(
        {
          success: false,
          error: cancellationErrors.map((item) => item.message).join(' '),
        },
        {status: 400},
      );
    }

    // Shopify processes cancellation asynchronously.
    return data({
      success: true,
      message:
        'Your cancellation has been submitted to Nimie. Please check your order status and Nimie Wallet balance shortly.',
      jobId: cancelPayload?.job?.id ?? null,
    });
  } catch (error) {
    console.error('Order cancellation failed:', error);

    return data(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during order cancellation.',
      },
      {status: 500},
    );
  }
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {order, cancelledItems = []} = useLoaderData();

  return (
    <AccountOrderDetails
      order={order}
      cancelledItems={cancelledItems}
    />
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */