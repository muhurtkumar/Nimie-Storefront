import {useLoaderData} from 'react-router';
import {getCustomerWishlist} from '~/lib/customer-wishlist';

import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

import {ProductDetails} from '~/components/Pdp/ProductDetails';
import {ProductIntro} from '~/components/Pdp/ProductIntro.jsx';
import FAQs from '~/components/Pdp/FAQs';
import {Reviews} from '~/components/Pdp/Reviews.jsx';
import productIntroImage from '~/assets/layout/ProductIntroImage.png';
import {BehindTheScenes} from '~/components/Home/BehindTheScenes';
import nimieLogo from '~/assets/home/nimie-logo.png';
import clip1 from '~/assets/home/clip-1.mp4';
import clip2 from '~/assets/home/clip-2.mp4';
import clip3 from '~/assets/home/clip-3.mp4';
import clip4 from '~/assets/home/clip-4.mp4';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ShopForMore} from '~/components/Home/ShopForMore.jsx';

const PRODUCT_INFO = [
  'Fabric: Pure cotton-linen',
  'Craft: Hand-embroidered Lucknow Chikankari',
  'Neckline: V-neck',
  'Sleeves: Bell sleeves',
  'Detail: Tie-knot detailing',
  'Fit: Oversized, relaxed fit',
];

const REVIEWS_QUERY = `#graphql
  query Reviews {
    metaobjects(type: "review", first: 20) {
      nodes {
        id
        reviewer_name: field(key: "reviewer_name") { value }
        review_date: field(key: "review_date") { value }
        review_text: field(key: "review_text") { value }
      }
    }
  }
`;

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {
      title: `Nimie | ${data?.product?.title ?? ''}`,
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product?.handle}`,
    },
  ];
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
 *
 * @param {Route.LoaderArgs} args
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const wishlist = await getCustomerWishlist({context});

  const [{product}, {metaobjects}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    storefront.query(REVIEWS_QUERY),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {
    handle,
    data: product,
  });

  const reviews = metaobjects.nodes.map((node) => ({
    id: node.id,
    name: node.reviewer_name?.value ?? 'Anonymous',
    date: node.review_date?.value ?? '',
    text: node.review_text?.value ?? '',
  }));

  return {
    product,
    reviews,
    wishlist,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable,
 *  the page should still 200.
 *
 * @param {Route.LoaderArgs} args
 */
// function loadDeferredData({context, params}) {
//   return {};
// }
function loadDeferredData({context}) {
  const showcaseProducts = context.storefront
    .query(PRODUCT_SHOWCASE_QUERY, {
      cache: context.storefront.CacheShort(),
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    showcaseProducts,
  };
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, reviews, showcaseProducts, wishlist} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });
  return (
    <>
      <ProductDetails
        key={product.id}
        product={product}
        selectedVariant={selectedVariant}
        productOptions={productOptions}
        wishlist={wishlist}
      />

      <ProductIntro
        image={productIntroImage}
        imageAlt="Nimie team"
        title="Halter Neck Heavy Chikankari"
        info={PRODUCT_INFO}
      />

      <Reviews reviews={reviews} />

      <ShopForMore products={showcaseProducts} />

      <BehindTheScenes
        videos={[clip1, clip2, clip3, clip4]}
        logo={nimieLogo}
        eyebrow="From Behind the Scenes"
        heading="Embroided with <3"
        description="From the heart of Lucknow, take an exclusive look behind the scenes at the makers keeping centuries-old craftsmanship alive in every Nimie kurti."
      />

      <FAQs />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable

    compareAtPrice {
      amount
      currencyCode
    }

    id

    image {
      __typename
      id
      url
      altText
      width
      height
    }

    price {
      amount
      currencyCode
    }

    product {
      title
      handle
    }

    selectedOptions {
      name
      value
    }

    sku

    title

    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle

    descriptionHtml
    description

    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }

    encodedVariantExistence
    encodedVariantAvailability

    variants(first: 250) {
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

    options {
      name

      optionValues {
        name

        firstSelectableVariant {
          ...ProductVariant
        }

        swatch {
          color

          image {
            previewImage {
              url
            }
          }
        }
      }
    }

    discountPercentage: metafield(
      namespace: "custom"
      key: "discountpercentage"
    ) {
      value
    }

    fabricDetails: metafield(
      namespace: "custom"
      key: "fabric_details"
    ) {
      value
    }

    sizeTip: metafield(
      namespace: "custom"
      key: "size_tip"
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

    sizeGuide: metafield(
      namespace: "custom"
      key: "size_guide"
    ) {
      references(first: 50) {
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

    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }

    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }

    seo {
      description
      title
    }
  }

  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }

  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_SHOWCASE_QUERY = `#graphql
  fragment ProductShowcaseItem on Product {
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
  }

  query ProductShowcase(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: 5
      sortKey: CREATED_AT
      reverse: true
    ) {
      nodes {
        ...ProductShowcaseItem
      }
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */