import {useLoaderData} from 'react-router';

import {MockShopNotice} from '~/components/MockShopNotice';

import {ProductShowcase} from '~/components/home/ProductShowcase';

import {Hero} from '~/components/home/Hero';
import heroBanner from '~/assets/home/hero-banner.png';



import {KnotLikeBefore} from './KnotLikeBefore';

import knotLikeBeforeImage from '~/assets/home/knot-like-before.png';

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
    .query(PRODUCT_SHOWCASE_QUERY)
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
    <div className="home">
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
      
      <KnotLikeBefore {...KNOT_LIKE_BEFORE_DATA} />

      <ProductShowcase products={data.showcaseProducts} />
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