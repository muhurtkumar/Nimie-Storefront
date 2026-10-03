import {
  CUSTOMER_WISHLIST_QUERY,
  CUSTOMER_WISHLIST_SET_MUTATION,
} from '~/graphql/customer-account/CustomerWishlistMutations';

/**
 * Parse the customer's JSON wishlist.
 */
function parseWishlist(metafield) {
  if (!metafield) {
    return [];
  }

  if (Array.isArray(metafield.jsonValue)) {
    return metafield.jsonValue;
  }

  if (metafield.jsonValue) {
    try {
      const wishlist = JSON.parse(metafield.jsonValue);

      return Array.isArray(wishlist) ? wishlist : [];
    } catch {
      // Fall back to the string value below.
    }
  }

  if (metafield.value) {
    try {
      const wishlist = JSON.parse(metafield.value);

      return Array.isArray(wishlist) ? wishlist : [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Get the current customer's wishlist.
 */
export async function getCustomerWishlist({context}) {
  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return [];
  }

  const {data, errors} = await customerAccount.query(
    CUSTOMER_WISHLIST_QUERY,
  );

  if (errors?.length) {
    console.error(
      'Failed to fetch customer wishlist:',
      JSON.stringify(errors, null, 2),
    );

    return [];
  }

  return parseWishlist(data?.customer?.wishlist);
}

/**
 * Add or remove a product + color combination
 * from the current customer's wishlist.
 */
export async function toggleCustomerWishlist({
  context,
  productId,
  colorId,
}) {
  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return {
      success: false,
      isLoggedIn: false,
      wishlist: [],
    };
  }

  if (!productId || !colorId) {
    return {
      success: false,
      isLoggedIn: true,
      wishlist: [],
      error: 'Product and color are required.',
    };
  }

  const {data, errors} = await customerAccount.query(
    CUSTOMER_WISHLIST_QUERY,
  );

  if (errors?.length || !data?.customer?.id) {
    console.error(
      'Failed to fetch customer wishlist:',
      JSON.stringify(errors, null, 2),
    );

    return {
      success: false,
      isLoggedIn: true,
      wishlist: [],
      error: 'Failed to fetch customer wishlist.',
    };
  }

  const customer = data.customer;
  const currentWishlist = parseWishlist(customer.wishlist);

  const existingIndex = currentWishlist.findIndex(
    (item) =>
      item?.productId === productId &&
      item?.colorId === colorId,
  );

  let updatedWishlist;

  if (existingIndex !== -1) {
    // Remove the existing product + color combination.
    updatedWishlist = currentWishlist.filter(
      (_, index) => index !== existingIndex,
    );
  } else {
    // Add the new product + color combination.
    updatedWishlist = [
      ...currentWishlist,
      {
        productId,
        colorId,
      },
    ];
  }

  const metafield = customer.wishlist;

  const {data: mutationData, errors: mutationErrors} =
    await customerAccount.mutate(
      CUSTOMER_WISHLIST_SET_MUTATION,
      {
        variables: {
          metafields: [
            {
              ownerId: customer.id,
              namespace: 'custom',
              key: 'wishlist',
              type: 'json',
              value: JSON.stringify(updatedWishlist),
              compareDigest: metafield?.compareDigest ?? null,
            },
          ],
        },
      },
    );

  if (mutationErrors?.length) {
    console.error(
      'Failed to update customer wishlist:',
      JSON.stringify(mutationErrors, null, 2),
    );

    return {
      success: false,
      isLoggedIn: true,
      wishlist: currentWishlist,
      error: 'Failed to update customer wishlist.',
    };
  }

  const userErrors = mutationData?.metafieldsSet?.userErrors;

  if (userErrors?.length) {
    console.error(
      'Failed to update customer wishlist userErrors:',
      JSON.stringify(userErrors, null, 2),
    );

    return {
      success: false,
      isLoggedIn: true,
      wishlist: currentWishlist,
      error: 'Failed to update customer wishlist.',
    };
  }

  return {
    success: true,
    isLoggedIn: true,
    added: existingIndex === -1,
    wishlist: updatedWishlist,
  };
}