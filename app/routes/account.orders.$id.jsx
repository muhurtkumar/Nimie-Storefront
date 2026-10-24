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

  return {order: data.order};
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
  const {order} = useLoaderData();
  return <AccountOrderDetails order={order} />;
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */