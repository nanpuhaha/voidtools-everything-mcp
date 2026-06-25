import type { EverythingHttpClient } from "../everythingHttpClient.js";

type SearchClient = Pick<EverythingHttpClient, "search">;

export async function runEverythingHealth(client: SearchClient) {
  const startedAt = Date.now();
  const response = await client.search({
    query: "*",
    offset: 0,
    count: 1,
    sort: "name",
    ascending: true,
    matchCase: false,
    wholeWord: false,
    matchPath: false,
    regex: false,
    diacritics: false
  });

  return {
    content: [
      {
        type: "text" as const,
        text: [
          "Everything HTTP Server is reachable.",
          `Latency: ${Date.now() - startedAt}ms`,
          `Total indexed matches for health query: ${response.totalResults}`
        ].join("\n")
      }
    ]
  };
}
