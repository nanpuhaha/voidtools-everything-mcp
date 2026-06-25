import { z } from "zod";

export const SortSchema = z.enum(["name", "path", "date_modified", "size"]);

export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  offset: z.number().int().min(0).default(0),
  count: z.number().int().min(1),
  sort: SortSchema.default("name"),
  ascending: z.boolean().default(true),
  matchCase: z.boolean().default(false),
  wholeWord: z.boolean().default(false),
  matchPath: z.boolean().default(false),
  regex: z.boolean().default(false),
  diacritics: z.boolean().default(false)
});

export type EverythingSearchRequest = z.infer<typeof SearchRequestSchema>;

export type EverythingSearchResult = {
  type: "file" | "folder" | "unknown";
  name: string;
  path: string;
  fullPath: string;
  size?: number;
  dateModified?: string;
};

export type EverythingSearchResponse = {
  totalResults: number;
  results: EverythingSearchResult[];
};
