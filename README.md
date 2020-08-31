# lastfm-proxy

A Cloudflare Worker acting as a proxy for the LastFM API in order to expose endpoints.

The dev and prod versions I built this for are deployed to the following, targeting my last.fm user account, [BrianMitchL](https://www.last.fm/user/BrianMitchL).

| Environment | URL                                |
| ----------- | ---------------------------------- |
| Dev         | https://lastfm-proxy-dev.brianm.me |
| Prod        | https://lastfm-proxy.brianm.me     |

## Getting Started

This worker is meant to be used with [Wrangler](https://github.com/cloudflare/wrangler). Documentation can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler/).

### Developing

[`src/index.js`](./src/index.ts) calls the request handler in [`src/handler.ts`](./src/handler.ts), and will return the [request method](https://developer.mozilla.org/en-US/docs/Web/API/Request/method) for the given request.

#### Configuration

There are two environment variables used to configure the worker.

| Variable          | Use                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `LASTFM_USERNAME` | The LastFM username to source the data from.                                                                      |
| `LASTFM_API_KEY`  | The LastFM API key used to authorize the request. This is configured as a secret variable in Cloudflare/Wrangler. |

#### Testing

`npm run test` will run the tests.

### Previewing and Publishing

For information on how to preview and publish your worker, please see the [Wrangler docs](https://developers.cloudflare.com/workers/tooling/wrangler/commands/#publish).

Run `wrangler preview` to run a test version of the worker.

Run `wrangler publish --env dev` or `wrangler publish` to publish the dev or prod versions.
