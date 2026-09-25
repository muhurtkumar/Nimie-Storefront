import {useLoaderData} from 'react-router';

import {MockShopNotice} from '~/components/MockShopNotice';

import {ProductShowcase} from '~/components/Home/ProductShowcase';

import {Hero} from '~/components/Home/Hero';
import heroBanner from '~/assets/home/hero-banner.png';
import {KnotLikeBefore} from '~/components/Home/KnotLikeBefore';
import knotLikeBeforeImage from '~/assets/home/knot-like-before.png';
import {BehindTheScenes} from '~/components/Home/BehindTheScenes';
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {dummyInstagramReels} from '~/components/InstagramReels/getInstagramReels.js';
import nimieLogo from '~/assets/home/nimie-logo.png';
import clip1 from '~/assets/home/clip-1.mp4';
import clip2 from '~/assets/home/clip-2.mp4';
import clip3 from '~/assets/home/clip-3.mp4';
import clip4 from '~/assets/home/clip-4.mp4';

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
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
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
  return {
    showcaseProducts,
  };
}

const KNOT_LIKE_BEFORE_DATA = {
  image: knotLikeBeforeImage,
  imageAlt: 'Nimie designer wearing a chikankari saree',
  eyebrow: 'A NOTE FROM THE DESIGNER',
  heading: 'Knot like Before',
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
        imageAlt="Nimie new collection"
        eyebrow="Meet Lucknow chikankari, the Nimie way."
        heading="The classics got a makeover."
        cta={{label: 'JOIN THE WAITLIST', to: '#waitlist'}}
      />

      <ProductShowcase products={data.showcaseProducts} />

      <KnotLikeBefore {...KNOT_LIKE_BEFORE_DATA} />

      <BehindTheScenes
        videos={[clip1, clip2, clip3, clip4]}
        logo={nimieLogo}
        eyebrow="From Behind the Scenes"
        heading="Embroided with <3"
        description="From the heart of Lucknow, take an exclusive look behind the scenes at the makers keeping centuries-old craftsmanship alive in every Nimie kurti."
      />

      <InstagramReels
        reels={dummyInstagramReels}
        instagramHandle="@NIMIE.IN"
      />
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

    images(first: 6) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }

    options {
      name
      optionValues {
        name
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
