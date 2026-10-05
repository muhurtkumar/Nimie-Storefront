const INSTAFEED_ENDPOINT = 'https://instafeed.nfcube.com/feed/v6';

export async function getInstagramFeed(env) {
  const apiKey = env.INSTAFEED_API_KEY;

  if (!apiKey) {
    throw new Error('INSTAFEED_API_KEY is not available');
  }

  const url = new URL(INSTAFEED_ENDPOINT);

  url.searchParams.set('limit', '50');
  url.searchParams.set('account', 'pf8ggf-un.myshopify.com');
  url.searchParams.set('fu', '0');
  url.searchParams.set('fid', '0');
  url.searchParams.set('debug', '1');

  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Instafeed API failed: ${response.status} ${JSON.stringify(data)}`,
    );
  }

  return data;
}