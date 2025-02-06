import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import { handleRequest } from "../src/handler";

const env = {
  LASTFM_USERNAME: "testusername",
  LASTFM_API_KEY: "testapikey",
};

// this could be any valid URL for the purpose of the test, but why not use the dev value
const urlBase = "https://lastfm-proxy-dev.brianm.me";

describe("handler returns response with 405 status for all methods besides GET", () => {
  const methods = [
    "HEAD",
    "POST",
    "PUT",
    "DELETE",
    "CONNECT",
    "OPTIONS",
    "TRACE",
    "PATCH",
  ];
  it.each(methods)(`%s`, async (method) => {
    const result = await handleRequest(
      new Request(`${urlBase}/`, { method }),
      env,
    );
    expect(result.status).toBe(405);
    expect(result.statusText).toBe("Method Not Allowed");
    expect(await result.text()).toBe("Method Not Allowed");
  });
});

describe("handler returns response with GET methods", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMockIf(/^https:\/\/ws\.audioscrobbler.com.*$/, async (req) => {
      if (req.url.includes("user.getTopTracks")) {
        return {
          body: JSON.stringify({ toptracks: { track: [] } }),
          headers: {
            "Content-Type": "application/json",
          },
        };
      } else if (req.url.includes("user.getTopArtists")) {
        return {
          body: JSON.stringify({ topartists: { artist: [] } }),
          headers: {
            "Content-Type": "application/json",
          },
        };
      } else {
        return {
          status: 404,
          body: "Not Found",
        };
      }
    });
  });

  it("responds with 404 status on the root route", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(404);
    expect(result.statusText).toBe("Route Not Found");
    expect(await result.text()).toBe("Route Not Found");
    expect(fetchMock.mock.calls).toHaveLength(0);
  });

  it("responds to the /tracks route", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/tracks`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.headers.get("Content-Type")).toEqual("application/json");
    expect(result.headers.get("Cache-Control")).toEqual("max-age=1800");
    expect(await result.json()).toEqual({ toptracks: { track: [] } });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=testusername&api_key=testapikey&format=json&period=overall&limit=10",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      cf: {
        cacheTtl: 60,
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
  });

  it("responds to the /tracks route with a period specified", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/tracks?period=1month`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.headers.get("Content-Type")).toEqual("application/json");
    expect(result.headers.get("Cache-Control")).toEqual("max-age=1800");
    expect(await result.json()).toEqual({ toptracks: { track: [] } });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=testusername&api_key=testapikey&format=json&period=1month&limit=10",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      cf: {
        cacheTtl: 60,
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
  });

  it("responds to the /artists route", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/artists`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.headers.get("Content-Type")).toEqual("application/json");
    expect(result.headers.get("Cache-Control")).toEqual("max-age=1800");
    expect(await result.json()).toEqual({ topartists: { artist: [] } });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=testusername&api_key=testapikey&format=json&period=overall&limit=10",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      cf: {
        cacheTtl: 60,
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
  });

  it("responds to the /artists route with a period specified", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/artists?period=7day`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.headers.get("Content-Type")).toEqual("application/json");
    expect(result.headers.get("Cache-Control")).toEqual("max-age=1800");
    expect(await result.json()).toEqual({ topartists: { artist: [] } });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=testusername&api_key=testapikey&format=json&period=7day&limit=10",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      cf: {
        cacheTtl: 60,
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
  });

  it("responds with 400 if an invalid period is supplied", async () => {
    const result = await handleRequest(
      new Request(`${urlBase}/artists?period=notagoodone`, { method: "GET" }),
      env,
    );
    expect(result.status).toBe(400);
    expect(result.statusText).toBe("Bad Request");
    expect(await result.text()).toBe(
      "Invalid period, must be omitted or one of the following: overall | 7day | 1month | 3month | 6month | 12month",
    );
    expect(fetchMock.mock.calls).toHaveLength(0);
  });
});
