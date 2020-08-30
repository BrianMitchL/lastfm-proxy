export async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    // overall | 7day | 1month | 3month | 6month | 12month
    const period = url.searchParams.get('period') || 'overall';

    let method = '';
    if (url.pathname === '/tracks') {
      method = 'user.getTopTracks';
    } else if (url.pathname === '/artists') {
      method = 'user.getTopArtists';
    } else {
      return new Response('Route Not Found', {
        status: 404,
        statusText: 'Route Not Found',
      });
    }

    const searchParams = new URLSearchParams({
      method,
      user: LASTFM_USERNAME,
      api_key: LASTFM_API_KEY,
      format: 'json',
      period,
      limit: '10',
    });

    const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?${searchParams.toString()}`;
    let response = await fetch(lastFmUrl, {
      cf: {
        // Tell CloudFlare's Global CDN to always cache this fetch regardless of content type
        // for a max of 60 seconds before revalidating the resource
        cacheTtl: 60, // sets TTL to 60 and cacheEverything setting
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
    // must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response);
    //Set cache control headers to cache on browser for 30 minutes
    response.headers.set('Cache-Control', 'max-age=1800');
    return response;
  }
  return new Response('Method Not Allowed', {
    status: 405,
    statusText: 'Method Not Allowed',
  });
}
