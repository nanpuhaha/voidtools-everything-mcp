import { describe, expect, it, vi } from "vitest";
import { EverythingHttpClient } from "../src/everythingHttpClient.js";

describe("EverythingHttpClient", () => {
  it("builds a bounded JSON search URL and parses results", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toBe(
        "http://127.0.0.1:8080/?search=report&offset=5&count=10&json=1&path_column=1&size_column=1&date_modified_column=1&sort=date_modified&ascending=0"
      );

      return new Response(
        JSON.stringify({
          totalResults: 1,
          results: [
            {
              type: "file",
              name: "report.md",
              path: "C:\\Users\\KU\\Documents",
              size: "1234",
              date_modified: "2026-06-25T01:02:03.000Z"
            }
          ]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    });

    const client = new EverythingHttpClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5000,
      fetchImpl
    });

    const result = await client.search({
      query: "report",
      offset: 5,
      count: 10,
      sort: "date_modified",
      ascending: false,
      matchCase: false,
      wholeWord: false,
      matchPath: false,
      regex: false,
      diacritics: false
    });

    expect(result.totalResults).toBe(1);
    expect(result.results[0]).toEqual({
      type: "file",
      name: "report.md",
      path: "C:\\Users\\KU\\Documents",
      fullPath: "C:\\Users\\KU\\Documents\\report.md",
      size: 1234,
      dateModified: "2026-06-25T01:02:03.000Z"
    });
  });

  it("throws a clear error when Everything returns a non-200 response", async () => {
    const fetchImpl = vi.fn(async () => new Response("Unauthorized", { status: 401 }));
    const client = new EverythingHttpClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5000,
      fetchImpl
    });

    await expect(
      client.search({
        query: "x",
        offset: 0,
        count: 1,
        sort: "name",
        ascending: true,
        matchCase: false,
        wholeWord: false,
        matchPath: false,
        regex: false,
        diacritics: false
      })
    ).rejects.toThrow("Everything HTTP request failed with status 401");
  });

  it("throws a clear error when the configured server is not Everything JSON", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response("<html></html>", {
          status: 200,
          headers: { "content-type": "text/html" }
        })
    );
    const client = new EverythingHttpClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5000,
      fetchImpl
    });

    await expect(
      client.search({
        query: "x",
        offset: 0,
        count: 1,
        sort: "name",
        ascending: true,
        matchCase: false,
        wholeWord: false,
        matchPath: false,
        regex: false,
        diacritics: false
      })
    ).rejects.toThrow(
      "Everything HTTP request did not return JSON. Check EVERYTHING_BASE_URL points to the Everything HTTP Server."
    );
  });
});
