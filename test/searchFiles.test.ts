import { describe, expect, it, vi } from "vitest";
import { runEverythingSearch } from "../src/tools/searchFiles.js";

describe("runEverythingSearch", () => {
  it("uses defaults, clamps count, and returns MCP text content", async () => {
    const client = {
      search: vi.fn(async () => ({
        totalResults: 2,
        results: [
          {
            type: "file" as const,
            name: "notes.md",
            path: "C:\\Users\\KU",
            fullPath: "C:\\Users\\KU\\notes.md",
            size: 100,
            dateModified: "2026-06-25T00:00:00.000Z"
          }
        ]
      }))
    };

    const response = await runEverythingSearch(
      { query: "notes", count: 500 },
      client,
      { defaultCount: 20, maxCount: 100 }
    );

    expect(client.search).toHaveBeenCalledWith({
      query: "notes",
      offset: 0,
      count: 100,
      sort: "name",
      ascending: true,
      matchCase: false,
      wholeWord: false,
      matchPath: false,
      regex: false,
      diacritics: false
    });
    expect(response.content[0].type).toBe("text");
    expect(response.content[0].text).toContain("C:\\Users\\KU\\notes.md");
  });
});
