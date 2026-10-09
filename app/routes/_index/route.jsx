import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {getCustomerWishlist} from '~/lib/customer-wishlist';

import {MockShopNotice} from '~/components/MockShopNotice';

import {ProductShowcase} from '~/components/Home/ProductShowcase';

import {Hero} from '~/components/Home/Hero';
import heroBanner from '~/assets/home/hero-banner.png';
import heroBannerVideo from '~/assets/home/hero-banner-video.webm';
import {KnotLikeBefore} from '~/components/Home/KnotLikeBefore';
import knotLikeBeforeImage from '~/assets/home/knot-like-before.png';
import knotLikeBeforeHeading from '~/assets/home/KnotLikeBeforeHeading.png';
import knotLikeBeforeSmile from '~/assets/home/KnotLikeBeforeSmile.png';
import {BehindTheScenes} from '~/components/Home/BehindTheScenes';
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import nimieLogo from '~/assets/home/nimie-logo.png';
import homepageBts from '~/assets/home/homepage_bts.webm';

import {restoreCustomerCart} from '~/lib/customer-cart';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Nimie | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const wishlist = await getCustomerWishlist({
    context: args.context,
  });

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
    wishlist,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
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

const instagramReels = import('~/lib/instafeed.server.js')
  .then(({getInstagramFeed}) => getInstagramFeed(context.env))
  .then((data) => {
    const reels = (data?.data || [])
      .filter(
        (item) =>
          item.type === 'video' &&
          item.videos?.standard_resolution?.url,
      )
      .map((item) => ({
        id: item.id,
        media_type: 'VIDEO',
        media_url: `/api/instagram-media?url=${encodeURIComponent(
          item.videos.standard_resolution.url,
        )}`,
        thumbnail_url: item.images?.standard_resolution?.url
          ? `/api/instagram-media?url=${encodeURIComponent(
              item.images.standard_resolution.url,
            )}`
          : '',
        permalink: item.link,
        caption: item.caption?.text || '',
      }));

    return reels;
  })
  .catch((error) => {
    throw error;
  });
  return {
    showcaseProducts,
    instagramReels,
  };
}

const KNOT_LIKE_BEFORE_DATA = {
  image: knotLikeBeforeImage,
  imageAlt: 'Nimie designer wearing a chikankari saree',
  eyebrow: 'GIRL BEHIND NIMIE',
  heading: 'Knot like Before',
  headingImage: knotLikeBeforeHeading,
  smileImage: knotLikeBeforeSmile,
  introTitle: 'For The Love Of Where We Come From.',
  description:
    'Nimie is our little expression of लखनऊ (Lucknow), its craft, its people and the beauty that has always been around us. We’re taking what we love about home and bringing it into the way we dress today. Easy pieces, thoughtful details and a little something unexpected. here are 3 promises from us:',
  points: [
    'Handcrafted, always. Made with intention, never mass-produced.',
    'People before products. Respecting the hands behind each piece.',
    'Made for today. For the way you dress now.',
  ],
};

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <div className="Home">
      {data.isShopLinked ? null : <MockShopNotice />}

      {/*
        Leave `cta` unset while the site is in prelaunch mode (see root.jsx
        PRELAUNCH_ALLOWED_PATHS) — add it back once /collections/all etc.
        are unlocked.
      */}
      <Hero
        image={heroBanner}
        video={heroBannerVideo}
        imageAlt="Nimie new collection"
        eyebrow="Meet Lucknow chikankari, the Nimie way."
        heading="The classics got a makeover."
        cta={{label: 'SHOP NOW', to: '/collections/all'}}
      />

      <ProductShowcase
        products={data.showcaseProducts}
        wishlist={data.wishlist}
      />

      <KnotLikeBefore {...KNOT_LIKE_BEFORE_DATA} />

      <BehindTheScenes
        videos={[homepageBts]}
        logo={nimieLogo}
        eyebrow="From Behind the Scenes"
        heading="Embroided with <3"
        description="From the heart of Lucknow, take an exclusive look behind the scenes at the makers keeping centuries-old craftsmanship alive in every Nimie kurti."
      />

      <Suspense fallback={null}>
        <Await resolve={data.instagramReels}>
          {(instagramReels) => (
            <InstagramReels
              reels={instagramReels}
              instagramHandle="@NIMIE.IN"
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

const PRODUCT_SHOWCASE_QUERY = `#graphql
  fragment ProductShowcaseItem on Product {
    id
    title
    handle
    productType
    tags

    featuredImage {
      id
      url
      altText
      width
      height
    }

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
      type
      value

      references(first: 10) {
        nodes {
          ... on Metaobject {
            id
            type

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
      type
      value

      references(first: 20) {
        nodes {
          __typename

          ... on Metaobject {
            id
            type

            fields {
              key
              type
              value

              reference {
                __typename

                ... on Metaobject {
                  id
                  type
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

/** @typedef {import('./+types/route').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */