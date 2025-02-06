import { handleRequest } from "./handler";

export interface Env {
  LASTFM_USERNAME: string;
  LASTFM_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return handleRequest(request, env);
  },
};
