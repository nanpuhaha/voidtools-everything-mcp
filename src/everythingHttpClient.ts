import type {
  EverythingSearchRequest,
  EverythingSearchResponse,
  EverythingSearchResult
} from "./everythingTypes.js";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type EverythingHttpClientOptions = {
  baseUrl: string;
  timeoutMs: number;
  fetchImpl?: FetchLike;
};

type RawEverythingResult = {
  type?: string;
  name?: string;
  path?: string;
  size?: number | string;
  date_modified?: string;
  dateModified?: string;
};

type RawEverythingResponse = {
  totalResults?: number;
  total_results?: number;
  totalResultsFormatted?: string;
  results?: RawEverythingResult[];
};

export class EverythingHttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: EverythingHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async search(request: EverythingSearchRequest): Promise<EverythingSearchResponse> {
    const url = this.buildSearchUrl(request);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Everything HTTP request failed with status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error(
          "Everything HTTP request did not return JSON. Check EVERYTHING_BASE_URL points to the Everything HTTP Server."
        );
      }

      const body = (await response.json()) as RawEverythingResponse;
      return this.normalizeResponse(body);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Everything HTTP request timed out after ${this.timeoutMs}ms`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSearchUrl(request: EverythingSearchRequest): string {
    const url = new URL(`${this.baseUrl}/`);
    url.searchParams.set("search", request.query);
    url.searchParams.set("offset", String(request.offset));
    url.searchParams.set("count", String(request.count));
    url.searchParams.set("json", "1");
    url.searchParams.set("path_column", "1");
    url.searchParams.set("size_column", "1");
    url.searchParams.set("date_modified_column", "1");
    url.searchParams.set("sort", request.sort);
    url.searchParams.set("ascending", request.ascending ? "1" : "0");

    if (request.matchCase) url.searchParams.set("case", "1");
    if (request.wholeWord) url.searchParams.set("wholeword", "1");
    if (request.matchPath) url.searchParams.set("path", "1");
    if (request.regex) url.searchParams.set("regex", "1");
    if (request.diacritics) url.searchParams.set("diacritics", "1");

    return url.toString();
  }

  private normalizeResponse(body: RawEverythingResponse): EverythingSearchResponse {
    const results = Array.isArray(body.results) ? body.results.map(normalizeResult) : [];
    return {
      totalResults: body.totalResults ?? body.total_results ?? results.length,
      results
    };
  }
}

function normalizeResult(result: RawEverythingResult): EverythingSearchResult {
  const name = result.name ?? "";
  const path = result.path ?? "";
  const type =
    result.type === "file" || result.type === "folder" ? result.type : "unknown";

  return {
    type,
    name,
    path,
    fullPath: joinWindowsPath(path, name),
    size: normalizeSize(result.size),
    dateModified: result.date_modified ?? result.dateModified
  };
}

function normalizeSize(size: number | string | undefined): number | undefined {
  if (typeof size === "number") {
    return size;
  }

  if (typeof size === "string" && size.trim() !== "") {
    const parsed = Number(size);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function joinWindowsPath(path: string, name: string): string {
  if (path === "") {
    return name;
  }

  if (path.endsWith("\\") || path.endsWith("/")) {
    return `${path}${name}`;
  }

  return `${path}\\${name}`;
}
