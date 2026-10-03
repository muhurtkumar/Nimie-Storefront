import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {ProductCard} from '~/components/Home/ProductCard';
import {
  getCustomerWishlist,
  toggleCustomerWishlist,
} from '~/lib/customer-wishlist';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Nimie | My Wishlist'}];
};

/**
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  const formData = await request.formData();

  const intent = formData.get('intent');
  const productId = formData.get('productId');
  const colorId = formData.get('colorId');

  if (intent !== 'toggle') {
    return {
      success: false,
      error: 'Invalid wishlist action.',
    };
  }

  const result = await toggleCustomerWishlist({
    context,
    productId,
    colorId,
  });

  return result;
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const wishlist = await getCustomerWishlist({context});

  const productIds = [
    ...new Set(
      wishlist
        .map((item) => item?.productId)
        .filter(Boolean),
    ),
  ];

  if (productIds.length === 0) {
    return {
      products: [],
      wishlist,
    };
  }

  let storefrontData;

  try {
    storefrontData = await context.storefront.query(
      WISHLIST_PRODUCTS_QUERY,
      {
        variables: {
          ids: productIds,
        },
      },
    );
  } catch (error) {
    console.error(
      'Failed to fetch wishlist products:',
      error,
    );

    console.error(
      'Wishlist Storefront error message:',
      error?.message,
    );

    return {
      products: [],
      wishlist,
    };
  }

  const products = wishlist
    .map((wishlistItem) => {
      const product = storefrontData?.nodes?.find(
        (node) => node?.id === wishlistItem?.productId,
      );

      if (!product) {
        return null;
      }

      return {
        ...product,
        wishlistColorId: wishlistItem?.colorId || null,
      };
    })
    .filter(Boolean);

  return {
    products,
    wishlist,
  };
}

export default function Wishlist() {
  /** @type {LoaderReturnData} */
  const {products: initialProducts} = useLoaderData();

  const [products, setProducts] = useState(initialProducts);

  const handleWishlistRemoved = (productId, colorId) => {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          !(
            product.id === productId &&
            product.wishlistColorId === colorId
          ),
      ),
    );
  };

  return (
    <div className="collection">
      <div className="mb-2 text-left">
        <h1 className="text-3xl font-semibold text-[#345225] md:text-4xl">
          My Wishlist : {products.length} items
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-center text-[16px] text-stone-600">
            Your wishlist is empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <ProductCard
              key={`${product.id}-${product.wishlistColorId || 'default'}`}
              product={product}
              index={index}
              initialColorId={product.wishlistColorId}
              showColorPalette={false}
              showBadge={false}
              wishlistLayout={true}
              onWishlistRemoved={handleWishlistRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const WISHLIST_PRODUCT_FRAGMENT = `#graphql
  fragment WishlistProduct on Product {
    id
    title
    handle
    productType
    tags

    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }

    discountPercentage: metafield(
      namespace: "custom"
      key: "discountpercentage"
    ) {
      value
    }

    colorPattern: metafield(
      namespace: "shopify"
      key: "color-pattern"
    ) {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }

    colorGalleries: metafield(
      namespace: "custom"
      key: "color_galleries"
    ) {
      references(first: 20) {
        nodes {
          ... on Metaobject {
            id
            fields {
              key
              type
              value

              reference {
                ... on Metaobject {
                  id
                }
              }

              references(first: 20) {
                nodes {
                  __typename

                  ... on MediaImage {
                    id
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }

                  ... on GenericFile {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
    }

    images(first: 6) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }

    variants(first: 100) {
      nodes {
        id
        quantityAvailable
        availableForSale

        selectedOptions {
          name
          value
        }
      }
    }

    featuredImage {
      id
      altText
      url
      width
      height
    }
  }
`;

const WISHLIST_PRODUCTS_QUERY = `#graphql
  query WishlistProducts(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...WishlistProduct
      }
    }
  }

  ${WISHLIST_PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/route').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */