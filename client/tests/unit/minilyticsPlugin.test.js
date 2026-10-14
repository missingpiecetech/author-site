import { describe, expect, it } from "vitest";
import { minilyticsTags } from "../../vite/minilyticsPlugin.js";

const CONFIGURED = {
  PUBLIC_MINILYTICS_HOST: "https://analytics.example.com/",
  PUBLIC_MINILYTICS_SITE_ID: "site_id",
  PUBLIC_MINILYTICS_SITE_KEY: "site_key",
};

describe("minilyticsTags", () => {
  it("adds the tracker, then the replay extension, in strict mode with no hash routing", () => {
    const tags = minilyticsTags(CONFIGURED);
    expect(tags.map((tag) => tag.attrs.src)).toEqual([
      "https://analytics.example.com/minilytics.js",
      "https://analytics.example.com/replay/ext.js",
    ]);
    expect(tags[0].attrs).toMatchObject({
      defer: true,
      "data-site-id": "site_id",
      "data-site-key": "site_key",
      "data-privacy-mode": "strict",
    });
    expect(tags[0].attrs).not.toHaveProperty("data-hash-routing");
    expect(tags[0].attrs).not.toHaveProperty("data-debug");
    expect(tags[1].attrs.defer).toBe(true);
  });

  for (const missing of Object.keys(CONFIGURED)) {
    it(`adds nothing when ${missing} is missing or blank`, () => {
      expect(minilyticsTags({ ...CONFIGURED, [missing]: undefined })).toEqual(
        [],
      );
      expect(minilyticsTags({ ...CONFIGURED, [missing]: "  " })).toEqual([]);
    });
  }
});
