import {
  CUSTOMER_CART_METAFIELD_QUERY,
  CUSTOMER_CART_METAFIELD_SET_MUTATION,
} from '~/graphql/customer-account/CustomerCartMutations';

export async function restoreCustomerCart({context}) {
  const {customerAccount, session} = context;

  const {data, errors} = await customerAccount.query(
    CUSTOMER_CART_METAFIELD_QUERY,
  );

  if (errors?.length) {
    console.error('Failed to fetch customer cart:', errors);
    return null;
  }

  const cartId = data?.customer?.metafield?.value;

  if (!cartId) {
    return null;
  }

  session.set('cartId', cartId);

  return cartId;
}

export async function saveCustomerCart({context, cartId}) {
  if (!cartId) {
    return null;
  }

  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return null;
  }

  const {data, errors} = await customerAccount.query(`
    #graphql
    query CustomerId {
      customer {
        id
      }
    }
  `);

  if (errors?.length || !data?.customer?.id) {
    console.error('Failed to fetch customer:', errors);
    return null;
  }

  const {data: mutationData, errors: mutationErrors} =
    await customerAccount.mutate(
      CUSTOMER_CART_METAFIELD_SET_MUTATION,
      {
        variables: {
          metafields: [
            {
              ownerId: data.customer.id,
              namespace: 'custom',
              key: 'cart_id',
              type: 'single_line_text_field',
              value: cartId,
            },
          ],
        },
      },
    );

  if (mutationErrors?.length) {
    console.error(
        'Failed to save customer cart:',
        JSON.stringify(mutationErrors, null, 2),
    );
    return null;
    }

  const userErrors = mutationData?.metafieldsSet?.userErrors;

  if (userErrors?.length) {
    console.error(
        'Failed to save customer cart userErrors:',
        JSON.stringify(userErrors, null, 2),
    );
    return null;
  }

  return cartId;
}