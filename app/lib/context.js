import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

const additionalContext = {};

// Countries supported by your configured Nimie markets.
const SUPPORTED_COUNTRIES = new Set([
  'IN',
  'US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'AE', 'QA', 'KW',
  'DE', 'FR', 'NL', 'IE', 'BE', 'CH', 'AT', 'DK', 'NO',
  'SE', 'FI', 'IT', 'ES', 'JP', 'KR',
  'MY', 'IL', 'SA', 'OM', 'BH', 'ZA', 'PT', 'PL', 'CZ', 'GR',
  'TH', 'ID', 'PH', 'VN', 'BR', 'MX', 'TR', 'CL', 'CO',
  'LK', 'NP', 'BD', 'EG', 'KE', 'NG', 'GH', 'PK',
]);

function getSelectedCountry(request) {
  const cookieHeader = request.headers.get('Cookie') || '';

  const match = cookieHeader.match(
    /(?:^|;\s*)nimie_country=([A-Z]{2})(?:;|$)/,
  );

  const country = match?.[1];

  return country && SUPPORTED_COUNTRIES.has(country)
    ? country
    : 'IN';
}

/**
 * Creates Hydrogen context.
 */
export async function createHydrogenRouterContext(
  request,
  env,
  executionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);

  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const country = getSelectedCountry(request);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,

      // Country context used by Shopify Storefront API queries.
      i18n: {
        language: 'EN',
        country,
      },

      cart: {
        queryFragment: CART_QUERY_FRAGMENT,

        getId: () => session.get('cartId'),

        setId: (cartId) => {
          session.set('cartId', cartId);
          return new Headers();
        },
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}

/** @typedef {Class<additionalContext>} AdditionalContextType */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
