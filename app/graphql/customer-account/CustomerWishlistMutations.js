export const CUSTOMER_WISHLIST_QUERY = `#graphql
  query CustomerWishlist {
    customer {
      id
      wishlist: metafield(
        namespace: "custom"
        key: "wishlist"
      ) {
        id
        namespace
        key
        type
        value
        jsonValue
        compareDigest
      }
    }
  }
`;

export const CUSTOMER_WISHLIST_SET_MUTATION = `#graphql
  mutation CustomerWishlistSet(
    $metafields: [MetafieldsSetInput!]!
  ) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        type
        value
        jsonValue
        compareDigest
      }

      userErrors {
        field
        message
        code
      }
    }
  }
`;