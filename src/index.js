/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
// export interface Env {
//  AIRTABLE_API_KEY: string;
//  AIRTABLE_BASE_ID: string;
//  AIRTABLE_TABLE_NAME: string;
//  MAIN_DOMAIN: string;
//  GITHUB_USERNAME: string;
// }

export default {
  async fetch(
    request,
    env,
    _ctx
  ) {
    const pathname = new URL(request.url).pathname;

    // Handle main domain redirect
    if (pathname === "/") {
      return Response.redirect(`https://${env.MAIN_DOMAIN}`, 302);
    }


    // Handle /gh
    if (pathname.startsWith("/gh")) {
      return Response.redirect(`https://github.com/${env.GITHUB_USERNAME}/${pathname.slice(4)}`, 302)
    }

    // Fetch from airtable
    const { records } = await (
      await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}?maxRecords=1&filterByFormula=${encodeURIComponent("{slug} = '" + pathname.slice(1) + "'")}`, {
        headers: new Headers({
          'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        }),
      }))
      .json()

    if (records.length === 0) {
      return new Response("Not found", { status: 404 })
    }

    return Response.redirect(records[0].fields.target, 302)
  }
}
