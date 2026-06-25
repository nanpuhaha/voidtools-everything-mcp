import { z } from "zod";
import { SearchRequestSchema, SortSchema } from "../everythingTypes.js";
import type { EverythingHttpClient } from "../everythingHttpClient.js";

export const EverythingSearchToolInputSchema = z.object({
  query: z.string().min(1).describe("Everything search query."),
  offset: z.number().int().min(0).optional().describe("Zero-based result offset."),
  count: z.number().int().min(1).optional().describe("Maximum number of results."),
  sort: SortSchema.optional().describe("Sort field."),
  ascending: z.boolean().optional().describe("Sort ascending when true."),
  matchCase: z.boolean().optional().describe("Match case-sensitive text."),
  wholeWord: z.boolean().optional().describe("Match whole words only."),
  matchPath: z.boolean().optional().describe("Search the full path."),
  regex: z.boolean().optional().describe("Treat query as a regular expression."),
  diacritics: z.boolean().optional().describe("Match diacritics.")
});

export type SearchToolConfig = {
  defaultCount: number;
  maxCount: number;
};

type SearchClient = Pick<EverythingHttpClient, "search">;

export async function runEverythingSearch(
  rawInput: unknown,
  client: SearchClient,
  config: SearchToolConfig
) {
  const input = EverythingSearchToolInputSchema.parse(rawInput);
  const request = SearchRequestSchema.parse({
    query: input.query,
    offset: input.offset ?? 0,
    count: Math.min(input.count ?? config.defaultCount, config.maxCount),
    sort: input.sort ?? "name",
    ascending: input.ascending ?? true,
    matchCase: input.matchCase ?? false,
    wholeWord: input.wholeWord ?? false,
    matchPath: input.matchPath ?? false,
    regex: input.regex ?? false,
    diacritics: input.diacritics ?? false
  });

  const response = await client.search(request);
  const lines = [
    `Total results: ${response.totalResults}`,
    `Returned results: ${response.results.length}`,
    "",
    ...response.results.map((result, index) =>
      [
        `${index + 1}. ${result.fullPath}`,
        `   type: ${result.type}`,
        result.size === undefined ? undefined : `   size: ${result.size}`,
        result.dateModified === undefined
          ? undefined
          : `   dateModified: ${result.dateModified}`
      ]
        .filter(Boolean)
        .join("\n")
    )
  ];

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n")
      }
    ]
  };
}
