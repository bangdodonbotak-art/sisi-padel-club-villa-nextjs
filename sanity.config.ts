import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

/**
 * Sanity Studio config — Phase 1 (CMS-ready, architecture.md §1).
 *
 * projectId / dataset come from env only; NOTHING is hard-coded here.
 * Dony must create the Sanity project himself and set these in Vercel:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 * Until then the Studio cannot start and the site keeps reading the local
 * content files (content/*.json + messages/*.json) — the build never blocks.
 * No token is stored in this repo; the read token lives in Vercel env only.
 */
export default defineConfig({
  name: "sisi-padel-club-villa",
  title: "Sisi Padel Club & Villa Bali",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
