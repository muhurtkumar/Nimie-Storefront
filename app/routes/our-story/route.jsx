import {OurStoryHero} from '~/components/OurStory/OurStoryHero';
import {AboutNimie} from '~/components/OurStory/AboutNimie';

import ourStoryHeroImage from '~/assets/OurStory/OurStoryHero.png';
import nimieLogoGreen from '~/assets/OurStory/nimi-logo-green.gif';
import nimieLogoWhite from '~/assets/OurStory/nimi-logo-white.gif';
import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {AboutCurator} from '~/components/OurStory/AboutCurator';
import {ShopAtNimie} from '~/components/OurStory/ShopAtNimie';
import {getCustomerWishlist} from '~/lib/customer-wishlist';

import {OurStoryQuote} from '~/components/OurStory/OurStoryQuote';
import ourStoryQuoteImage from '~/assets/OurStory/OurStoryQuote.png';
import ourStoryQuoteVideo from '~/assets/OurStory/OurStoryQuote.webm';

import aboutCuratorImage from '~/assets/OurStory/AboutCurator.png';
import aboutCuratorSignature from '~/assets/OurStory/AboutCuratorSignature.png';
import aboutCuratorLine from '~/assets/OurStory/OurStoryLine.png';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Nimie | Our Story'}];
};

/* =========================================================
   OUR STORY HERO DATA
   ========================================================= */

const OUR_STORY_HERO_DATA = {
  logoMark: nimieLogoGreen,
  logoMarkAlt: 'Nimie',

  description:
    "At Nimie™, we believe your everyday style shouldn't come at the cost of your heritage. By blending traditional artisan craftsmanship with contemporary design, we're keeping the art alive on your terms, effortless, versatile, and entirely wearable.",

  image: ourStoryHeroImage,
  imageAlt: 'Nimie Our Story',
};

const ABOUT_NIMIE_DATA = {
  logoMark: nimieLogoWhite,
  logoMarkAlt: 'Nimie',
};

const OUR_STORY_QUOTE_DATA = {
  image: ourStoryQuoteImage,
  video: ourStoryQuoteVideo,
  quote: "Because tradition doesn't have to stay the same to stay meaningful.",
};

const ABOUT_CURATOR_DATA = {
  image: aboutCuratorImage,
  imageAlt: 'Anika, founder of Nimie',
  eyebrow: 'About the curator',
  paragraphs: [
    "Hi, I'm Anika, a fashion designer, a NIFT graduate, and someone deeply rooted in India's cultural landscape.",
    "Growing up in Lucknow, heritage wasn't just something in history books, it was woven into my daily surroundings. Among all the local crafts, Chikankari was always closest to my heart.",
    "As I grew up and began defining my own style, a gap started to form. My wardrobe shifted toward contemporary silhouettes and clean cuts, while the Chikankari I loved remained heavy, traditional, and complex. I couldn't find authentic pieces that matched modern aesthetics. I felt disconnected from my own roots simply because the craft hadn't evolved with the times. So, I decided to design it myself.",
  ],
  signature: aboutCuratorSignature,
  signatureAlt: "Anika's signature",
  lineImage: aboutCuratorLine,
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const wishlist = await getCustomerWishlist({
    context: args.context,
  });

  // Not awaited, so the page streams in while products load
  const deferredData = loadDeferredData(args);

  const instagramReels = loadInstagramReels(args.context);

  return {
    ...deferredData,
    instagramReels,
    wishlist,
  };
}

/**
 * @param {Route.LoaderArgs['context']} context
 */
function loadInstagramReels(context) {
  return import('~/lib/instafeed.server.js')
    .then(({getInstagramFeed}) => getInstagramFeed(context.env))
    .then((data) => {
      return (data?.data || [])
        .filter(
          (item) =>
            item.type === 'video' && item.videos?.standard_resolution?.url,
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
    })
    .catch((error) => {
      console.error('Failed to load Instagram reels on Our Story page:', error);
      return [];
    });
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const allProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {allProducts};
}

export default function PreviewOurStory() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <main className="our-story-page">
      <OurStoryHero {...OUR_STORY_HERO_DATA} />

      <AboutNimie {...ABOUT_NIMIE_DATA} />

      <OurStoryQuote {...OUR_STORY_QUOTE_DATA} />

      <AboutCurator {...ABOUT_CURATOR_DATA} />

      <ShopAtNimie
        products={data.allProducts}
        wishlist={data.wishlist}
        title="Shop at Nimie"
      />

      <Suspense fallback={null}>
        <Await resolve={data.instagramReels}>
          {(reels) => (
            <InstagramReels reels={reels} instagramHandle="@nimie.in" />
          )}
        </Await>
      </Suspense>
    </main>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
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

  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
    ) {
      nodes {
        ...ProductShowcaseItem
      }
    }
  }
`;

/** @typedef {import('./+types/our-story').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */