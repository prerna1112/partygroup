import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Extroverts Next.js production experience", async () => {
  assert.equal(existsSync(new URL("../.next/BUILD_ID", import.meta.url)), true);

  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(page, /Good parties/);
  assert.match(page, /Use my location/);
  assert.match(page, /Enter OTP/);
  assert.match(layout, /Extroverts — Find your next scene/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(page, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
