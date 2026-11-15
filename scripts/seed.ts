// Seeds Supabase with the sample catalogue, frame sizes and builder items.
// Usage: npm run seed   (reads .env.local; needs SUPABASE_SERVICE_ROLE_KEY)
// Safe to re-run: rows are upserted by id, nothing is deleted.
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as seed from "../lib/seed-data";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

// Product photos bundled in /public are referenced by relative URL, which
// works on any domain. Replace them with your own uploads from the admin.
async function upsert(table: string, rows: object[], onConflict = "id") {
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table.padEnd(14)} ${rows.length} rows`);
}

(async () => {
  await upsert("categories", seed.seedCategories);
  await upsert("products", seed.seedProducts);
  await upsert("frame_sizes", seed.seedFrameSizes);
  await upsert("frame_styles", seed.seedFrameStyles);
  await upsert("builder_boxes", seed.seedBuilderBoxes);
  await upsert("builder_items", seed.seedBuilderItems);
  await upsert(
    "settings",
    [
      { key: "frame_extras", value: seed.seedFrameExtras },
      { key: "builder_extras", value: seed.seedBuilderExtras },
    ],
    "key"
  );
  console.log("\nDone. Your shop is seeded ♡");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
