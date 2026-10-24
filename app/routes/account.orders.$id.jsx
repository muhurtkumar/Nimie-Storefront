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
      if (
        typeof lineItemId !== 'string' ||
        !lineItemId
      ) {
        return data(
          {
            success: false,
            error: 'Please select a valid item to cancel.',
          },
          {status: 400},
        );
      }

      // Verify that the item belongs to this customer's order.
      const customerLineItems =
        customerOrder.lineItems?.nodes ?? [];

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

      // Only allow cancellation if the order is completely
      // unfulfilled. Partially fulfilled orders are rejected.
      if (
        verifiedOrder.displayFulfillmentStatus !== 'UNFULFILLED'
      ) {
        return data(
          {
            success: false,
            error:
              'This order may already be shipped or partially fulfilled. Please contact Nimie support.',
          },
          {status: 400},
        );
      }

      // Begin Shopify order-edit session.
      const beginResponse = await fetch(
        `https://${shop}/admin/api/2026-10/graphql.json`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            query: `
              mutation BeginItemCancellation($id: ID!) {
                orderEditBegin(id: $id) {
                  calculatedOrder {
                    id
                    lineItems(first: 100) {
                      nodes {
                        id
                        title
                        sku
                        quantity
                        editableQuantityBeforeChanges
                        variant {
                          id
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
            variables: {
              id: verifiedOrder.id,
            },
          }),
        },
      );

      const beginResult = await beginResponse.json();
      const beginPayload =
        beginResult.data?.orderEditBegin;

      if (
        !beginResponse.ok ||
        beginResult.errors?.length ||
        beginPayload?.userErrors?.length ||
        !beginPayload?.calculatedOrder
      ) {
        console.error(
          'Shopify orderEditBegin failed:',
          JSON.stringify(
            beginResult.errors ??
              beginPayload?.userErrors ??
              [],
          ),
        );

        return data(
          {
            success: false,
            error: 'Could not start item cancellation.',
          },
          {status: 502},
        );
      }

      const calculatedOrder = beginPayload.calculatedOrder;
      console.log(
        'Original selected item:',
        JSON.stringify(
          customerOrder.lineItems.nodes.find(
            (item) => item.id === lineItemId,
          ),
          null,
          2,
        ),
      );

      console.log(
        'Calculated order items:',
        JSON.stringify(
          calculatedOrder.lineItems.nodes.map((item) => ({
            id: item.id,
            title: item.title,
            sku: item.sku,
            quantity: item.quantity,
            editableQuantityBeforeChanges:
              item.editableQuantityBeforeChanges,
            variantId: item.variant?.id,
            variantTitle: item.variantTitle,
          })),
          null,
          2,
        ),
      );

      // Find the original line item selected by the customer.
      const originalLineItem = customerOrder.lineItems.nodes.find(
        (item) => item.id === lineItemId,
      );

      if (!originalLineItem) {
        return data(
          {
            success: false,
            error: 'This item does not belong to your order.',
          },
          {status: 400},
        );
      }

      // Match the calculated line item using the original line item ID.
      const calculatedLineItems = calculatedOrder.lineItems.nodes;

      // Match using the numeric resource ID after verifying the
      // original line item belongs to the customer's order.
      const originalNumericId = originalLineItem.id.split('/').pop();

      const matchingItems = calculatedLineItems.filter((item) => {
        const calculatedNumericId = item.id.split('/').pop();

        return calculatedNumericId === originalNumericId;
      });

      // Ensure exactly one calculated line item matches.
      if (matchingItems.length !== 1) {
        console.error('Could not uniquely match the selected order line item.', {
          originalLineItemId: originalLineItem.id,
          originalTitle: originalLineItem.title,
          calculatedItemIds: calculatedLineItems.map((item) => item.id),
          matchingItemsCount: matchingItems.length,
        });

        return data(
          {
            success: false,
            error: 'This item could not be uniquely matched for editing.',
          },
          {status: 400},
        );
      }

      // Declare the matched item exactly once.
      const calculatedLineItem = matchingItems[0];

      // Verify that the item can be cancelled.
      if (
        calculatedLineItem.editableQuantityBeforeChanges < 1 ||
        calculatedLineItem.quantity < 1
      ) {
        return data(
          {
            success: false,
            error: 'This item is no longer available for cancellation.',
          },
          {status: 400},
        );
      }

      // Stage removal of the selected line item.
      const quantityResponse = await fetch(
        `https://${shop}/admin/api/2026-10/graphql.json`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            query: `
              mutation RemoveSelectedItem(
                $id: ID!
                $lineItemId: ID!
                $quantity: Int!
                $restock: Boolean!
              ) {
                orderEditSetQuantity(
                  id: $id
                  lineItemId: $lineItemId
                  quantity: $quantity
                  restock: $restock
                ) {
                  calculatedOrder {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
              id: calculatedOrder.id,
              lineItemId: calculatedLineItem.id,
              quantity: 0,
              restock: true,
            },
          }),
        },
      );

      const quantityResult = await quantityResponse.json();
      const quantityPayload =
        quantityResult.data?.orderEditSetQuantity;

      if (
        !quantityResponse.ok ||
        quantityResult.errors?.length ||
        quantityPayload?.userErrors?.length ||
        !quantityPayload?.calculatedOrder
      ) {
        console.error(
          'Shopify orderEditSetQuantity failed:',
          JSON.stringify(
            quantityResult.errors ??
              quantityPayload?.userErrors ??
              [],
          ),
        );

        return data(
          {
            success: false,
            error: 'Shopify could not remove this item.',
          },
          {status: 502},
        );
      }

      // Commit the item removal to the existing order.
      const commitResponse = await fetch(
        `https://${shop}/admin/api/2026-10/graphql.json`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            query: `
              mutation CommitItemCancellation(
                $id: ID!
                $notifyCustomer: Boolean!
                $staffNote: String
              ) {
                orderEditCommit(
                  id: $id
                  notifyCustomer: $notifyCustomer
                  staffNote: $staffNote
                ) {
                  order {
                    id
                    cancelledAt
                    displayFinancialStatus
                    displayFulfillmentStatus
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
              id: calculatedOrder.id,
              notifyCustomer: true,
              staffNote:
                'Customer requested cancellation of an individual item through the Nimie storefront.',
            },
          }),
        },
      );

      const commitResult = await commitResponse.json();
      const commitPayload =
        commitResult.data?.orderEditCommit;

      if (
        !commitResponse.ok ||
        commitResult.errors?.length ||
        commitPayload?.userErrors?.length ||
        !commitPayload?.order
      ) {
        console.error(
          'Shopify orderEditCommit failed:',
          JSON.stringify(
            commitResult.errors ??
              commitPayload?.userErrors ??
              [],
          ),
        );

        return data(
          {
            success: false,
            error:
              'Shopify could not complete the item cancellation. Please check the order in Shopify Admin.',
          },
          {status: 502},
        );
      }

      // Save the cancelled item in the Shopify order metafield.
      let persistenceError = false;

      try {
        // Read existing cancelled items so we don't overwrite previous records.
        const existingData = await adminGraphQL(
          shop,
          adminHeaders,
          `
            query GetCancelledItemsForUpdate($id: ID!) {
              order(id: $id) {
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

        const existingValue =
          existingData.order?.metafield?.value;

        let savedItems = [];

        if (existingValue) {
          try {
            const parsed = JSON.parse(existingValue);

            if (Array.isArray(parsed)) {
              savedItems = parsed;
            }
          } catch {
            throw new Error(
              'The existing cancelled-items metafield contains invalid JSON.',
            );
          }
        }

        // Avoid creating duplicate records for the same line item.
        const alreadySaved = savedItems.some(
          (item) => item.lineItemId === selectedItem.id,
        );

        if (!alreadySaved) {
          savedItems.push({
            lineItemId: selectedItem.id,
            title: selectedItem.title,
            variantTitle: selectedItem.variantTitle,
            quantity: selectedItem.quantity,
            price: selectedItem.price,
            totalDiscount: selectedItem.totalDiscount,
            image: selectedItem.image,
            cancelledAt: new Date().toISOString(),
          });
        }

        const saveResult = await adminGraphQL(
          shop,
          adminHeaders,
          `
            mutation SaveCancelledItems($metafields: [MetafieldsSetInput!]!) {
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

        if (savePayload?.userErrors?.length) {
          throw new Error(
            savePayload.userErrors
              .map((error) => error.message)
              .join(', '),
          );
        }

        if (!savePayload?.metafields?.length) {
          throw new Error(
            'Shopify did not confirm that the cancelled-items metafield was saved.',
          );
        }
      } catch (error) {
        persistenceError = true;

        console.error(
          'Item cancellation succeeded, but saving cancelled-item metafield failed:',
          error instanceof Error ? error.message : error,
        );
      }

      return data({
        success: true,
        type: 'item-cancelled',
        lineItemId,
        persistenceError,
        message: persistenceError
          ? 'The item was cancelled, but its status could not be saved. Please refresh and check Shopify Admin.'
          : 'The selected item has been cancelled. Any applicable refund still needs to be processed.',
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
    console.error(
      'Order cancellation failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return data(
      {success: false, error: 'Something went wrong. Please try again later.'},
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