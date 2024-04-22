/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { TelegramHandler } from './components/telegram/index.js';
import { OnNewReport, OnUpdatedReport } from './components/mastodon/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method !== "POST") {
      return new Response("Bad Request", { status: 400 });
    }

    if (pathname === "/mastodon") {
      await handleMastodon(request, env, ctx);
      return new Response("Processed");
    }

    if (pathname === "/telegram") {
      await TelegramHandler(request, env, ctx);
      return new Response("Processed");
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleMastodon(request, env, ctx) {
  const requestJson = await request.json();

  const event = requestJson.event;
  switch (event) {
    case 'report.created':
      await OnNewReport(requestJson, env, ctx);
      break;

    case 'report.updated':
      await OnUpdatedReport(requestJson, env, ctx);
      break;
  }
}
