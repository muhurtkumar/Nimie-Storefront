import {Link, useLoaderData, useSearchParams} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {ProductCard} from '~/components/Home/ProductCard';
import {getCustomerWishlist} from '~/lib/customer-wishlist';

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
    pageBy: 12, // divisible by 2 and 3 so the grid rows stay full
  });

  const [wishlist, {products}] = await Promise.all([
    getCustomerWishlist({context}),

    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);

  return {
    products,
    wishlist,
  };
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
  const {products, wishlist} = useLoaderData();

  return (
    <div className="collection">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-[#345225] md:text-4xl">
          The Nimie Products
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {products.nodes.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            wishlist={wishlist}
          />
        ))}
      </div>

      <ShopPagination pageInfo={products.pageInfo} />
    </div>
  );
}

/**
 * Previous / Next pagination driven by URL params.
 * `cursor` + `direction` are read by getPaginationVariables in the loader;
 * `page` is only used for the "Page N" label.
 */
const GREEN = '#345225';

function ShopPagination({pageInfo}) {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const {hasPreviousPage, hasNextPage, startCursor, endCursor} = pageInfo;

  if (!hasPreviousPage && !hasNextPage) return null;

  // Going back to page 1 just uses the clean URL
  const prevTo =
    page <= 2
      ? '?'
      : `?direction=previous&cursor=${encodeURIComponent(startCursor)}&page=${page - 1}`;
  const nextTo = `?direction=next&cursor=${encodeURIComponent(endCursor)}&page=${page + 1}`;

  const btn =
    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors';
  const btnActive = `${btn} hover:bg-[#345225]/10`;
  const btnDisabled = `${btn} cursor-not-allowed opacity-40`;
  // inline color: global `a { color }` rules would otherwise override classes
  const colorStyle = {color: GREEN, textDecoration: 'none'};

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex items-center justify-center border-t border-[#345225]/15 pt-6"
    >
      {/* Center: Previous | Page N | Next */}
      <div className="flex items-center gap-3 sm:gap-5">
        {hasPreviousPage ? (
          <Link
            to={prevTo}
            prefetch="intent"
            className={btnActive}
            style={colorStyle}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Previous
          </Link>
        ) : (
          <span className={btnDisabled} style={colorStyle}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Previous
          </span>
        )}

        <span
          className="min-w-[64px] text-center text-sm"
          style={{color: GREEN}}
        >
          Page {page}
        </span>

        {hasNextPage ? (
          <Link
            to={nextTo}
            prefetch="intent"
            className={btnActive}
            style={colorStyle}
          >
            Next
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        ) : (
          <span className={btnDisabled} style={colorStyle}>
            Next
            <ChevronRight size={16} strokeWidth={2.5} />
          </span>
        )}
      </div>

    </nav>
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