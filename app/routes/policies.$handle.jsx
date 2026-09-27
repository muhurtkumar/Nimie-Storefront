import {Link, useLoaderData} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Nimie | ${data?.policy.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
    m1.toUpperCase(),
  );

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

const policyCss = `
.policy {
  max-width: 1180px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  font-family: 'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #222;
}

.policy__title {
  text-align: center;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0 0 28px;
  letter-spacing: -0.01em;
}

/* --- Shopify policy body formatting --- */
.policy__body {
  font-size: 15px;
  line-height: 1.6;
}

.policy__body p {
  margin: 0 0 12px;
}

.policy__body h1,
.policy__body h2,
.policy__body h3 {
  margin: 28px 0 10px;
  font-weight: 700;
  line-height: 1.3;
  color: #111;
}

.policy__body h1 { font-size: 24px; }
.policy__body h2 { font-size: 21px; }
.policy__body h3 { font-size: 18px; }

.policy__body h1:first-child,
.policy__body h2:first-child,
.policy__body h3:first-child {
  margin-top: 0;
}

/* real <ul>/<li> bullets, if present */
.policy__body ul,
.policy__body ol {
  margin: 0 0 12px;
  padding-left: 22px;
}

.policy__body li {
  margin-bottom: 8px;
}

.policy__body li:last-child {
  margin-bottom: 0;
}

/* Shopify's "indent" button wraps text in <p style="padding-left:...">
   instead of a real list — this fakes a bullet marker for those */
.policy__body p[style*="padding-left"] {
  position: relative;
  margin-bottom: 8px;
}

.policy__body p[style*="padding-left"]::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #222;
}

.policy__body strong,
.policy__body b {
  font-weight: 700;
  color: #111;
}

.policy__body a {
  color: #A83B96;
  text-decoration: underline;
}

.policy__body hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 24px 0;
}
`;

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy} = useLoaderData();

  return (
    <div className="policy">
      <style>{policyCss}</style>
      <h1 className="policy__title">{policy.title}</h1>
      <div
        className="policy__body"
        dangerouslySetInnerHTML={{__html: policy.body}}
      />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('./+types/policies.$handle').Route} Route */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */