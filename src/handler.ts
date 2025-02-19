import { Env } from "./index";

type Period = "overall" | "7day" | "1month" | "3month" | "6month" | "12month";
const validPeriods = [
  "overall",
  "7day",
  "1month",
  "3month",
  "6month",
  "12month",
];

function isPeriod(maybePeriod: string): maybePeriod is Period {
  return validPeriods.includes(maybePeriod);
}

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method === "GET") {
    const url = new URL(request.url);

    let method = "";
    if (url.pathname === "/tracks") {
      method = "user.getTopTracks";
    } else if (url.pathname === "/artists") {
      method = "user.getTopArtists";
    } else {
      return new Response("Route Not Found", {
        status: 404,
        statusText: "Route Not Found",
      });
    }

    const period = url.searchParams.get("period") || "overall";

    if (!isPeriod(period)) {
      return new Response(
        "Invalid period, must be omitted or one of the following: overall | 7day | 1month | 3month | 6month | 12month",
        {
          status: 400,
          statusText: "Bad Request",
        },
      );
    }

    const searchParams = new URLSearchParams({
      method,
      user: env.LASTFM_USERNAME,
      api_key: env.LASTFM_API_KEY,
      format: "json",
      period,
      limit: "10",
    });

    const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?${searchParams.toString()}`;
    const lastFmResponse = await fetch(lastFmUrl, {
      cf: {
        // Tell CloudFlare's Global CDN to always cache this fetch regardless of content type
        // for a max of 60 seconds before revalidating the resource
        cacheTtl: 60, // sets TTL to 60 and cacheEverything setting
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });

    // must use Response constructor to inherit all of response's fields
    const response = new Response(lastFmResponse.body, lastFmResponse);
    if (lastFmResponse.ok) {
      //Set cache control headers to cache on browser for 30 minutes
      response.headers.set("Cache-Control", "max-age=1800");
    }
    return response;
  }
  return new Response("Method Not Allowed", {
    status: 405,
    statusText: "Method Not Allowed",
  });
}
