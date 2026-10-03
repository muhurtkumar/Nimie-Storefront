import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/Home/ProductCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Nimie | Products`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);

  return {products};
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();

  return (
    <div className="collection">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-[#345225] md:text-4xl">
          The Nimie Products
        </h1>
      </div>

      <PaginatedResourceSection
        connection={products}
        resourcesClassName="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {({node: product, index}) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment CollectionItem on Product {
    id
    title
    handle
    productType
    tags

    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
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

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
    ) {
      nodes {
        ...CollectionItem
      }

      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }

  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */