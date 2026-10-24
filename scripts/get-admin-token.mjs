import 'dotenv/config';

const shop = process.env.SHOPIFY_SHOP;
const clientId = process.env.SHOPIFY_API_KEY;
const clientSecret = process.env.SHOPIFY_API_SECRET;

const tokenResponse = await fetch(
  `https://${shop}/admin/oauth/access_token`,
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  },
);

const token = await tokenResponse.json();

if (!tokenResponse.ok) {
  console.error('Token error:', token);
  process.exit(1);
}

console.log('Granted scopes:', token.scope);

const ordersResponse = await fetch(
  `https://${shop}/admin/api/2026-10/orders.json?limit=1`,
  {
    headers: {
      'X-Shopify-Access-Token': token.access_token,
      'Content-Type': 'application/json',
    },
  },
);

const ordersResult = await ordersResponse.json();

console.log('Orders API status:', ordersResponse.status);

if (!ordersResponse.ok) {
  console.error('Orders API error:', ordersResult);
} else {
  console.log('Orders API request succeeded.');
  console.log('Orders returned:', ordersResult.orders?.length ?? 0);
}