export const CUSTOMER_CART_METAFIELD_QUERY = `#graphql
  query CustomerCartMetafield {
    customer {
      id
      metafield(namespace: "custom", key: "cart_id") {
        id
        value
        compareDigest
      }
    }
  }
`;

export const CUSTOMER_CART_METAFIELD_SET_MUTATION = `#graphql
  mutation CustomerCartMetafieldSet(
    $metafields: [MetafieldsSetInput!]!
  ) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
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