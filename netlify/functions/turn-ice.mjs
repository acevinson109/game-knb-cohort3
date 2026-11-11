export default async () => {
  const appDomain = process.env.METERED_APP_DOMAIN;
  const apiKey = process.env.METERED_TURN_API_KEY;

  if (!appDomain || !apiKey) {
    return new Response(JSON.stringify({
      error: 'TURN is not configured. Add METERED_APP_DOMAIN and METERED_TURN_API_KEY in Netlify.'
    }), {
      status: 503,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  }

  const host = appDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  if (!/^[a-z0-9.-]+$/i.test(host)) {
    return new Response(JSON.stringify({
      error: 'METERED_APP_DOMAIN must be a hostname only.'
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  }

  try {
    const url = new URL(`https://${host}/api/v1/turn/credentials`);
    url.searchParams.set('apiKey', apiKey);

    const upstream = await fetch(url, {
      headers: { accept: 'application/json' }
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({
        error: `Metered returned HTTP ${upstream.status}. Check the TURN credential and expiry.`
      }), {
        status: 502,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        }
      });
    }

    const iceServers = await upstream.json();

    if (!Array.isArray(iceServers) ||
        !iceServers.some(s => String(s.urls || '').startsWith('turn:'))) {
      return new Response(JSON.stringify({
        error: 'Metered did not return TURN relay servers.'
      }), {
        status: 502,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        }
      });
    }

    return new Response(JSON.stringify(iceServers), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store, max-age=0',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch {
    return new Response(JSON.stringify({
      error: 'Could not contact the TURN provider. Try again later.'
    }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  }
};
