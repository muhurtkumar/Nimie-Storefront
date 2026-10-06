const ALLOWED_HOSTS = [
  'cdninstagram.com',
  'instagram.com',
];

function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.some(
    (allowedHost) =>
      hostname === allowedHost ||
      hostname.endsWith(`.${allowedHost}`),
  );
}

export async function loader({request}) {
  const requestUrl = new URL(request.url);
  const mediaUrl = requestUrl.searchParams.get('url');

  if (!mediaUrl) {
    return new Response('Missing media URL', {
      status: 400,
    });
  }

  let upstreamUrl;

  try {
    upstreamUrl = new URL(mediaUrl);
  } catch {
    return new Response('Invalid media URL', {
      status: 400,
    });
  }

  if (!isAllowedHost(upstreamUrl.hostname)) {
    return new Response('Invalid media host', {
      status: 403,
    });
  }

  try {
    const headers = new Headers();

    const range = request.headers.get('Range');

    if (range) {
      headers.set('Range', range);
    }

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers,
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return new Response('Unable to fetch Instagram media', {
        status: upstreamResponse.status,
      });
    }

    const responseHeaders = new Headers();

    const contentType = upstreamResponse.headers.get('Content-Type');
    const contentLength = upstreamResponse.headers.get('Content-Length');
    const contentRange = upstreamResponse.headers.get('Content-Range');
    const acceptRanges = upstreamResponse.headers.get('Accept-Ranges');
    const cacheControl = upstreamResponse.headers.get('Cache-Control');

    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }

    responseHeaders.set(
      'Cache-Control',
      cacheControl || 'public, max-age=3600',
    );

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Instagram media proxy error:', error);

    return new Response('Unable to fetch Instagram media', {
      status: 500,
    });
  }
}