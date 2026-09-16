import type { APIRoute } from "astro";
import { app } from "../../server";

export const ALL: APIRoute = async ({ request }) => {
  return app.fetch(request);
};
