#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { EverythingHttpClient } from "./everythingHttpClient.js";
import {
  EverythingSearchToolInputSchema,
  runEverythingSearch
} from "./tools/searchFiles.js";
import { runEverythingHealth } from "./tools/health.js";

const config = loadConfig();
const client = new EverythingHttpClient({
  baseUrl: config.baseUrl,
  timeoutMs: config.timeoutMs
});

const server = new McpServer({
  name: "voidtools-everything-mcp",
  version: "0.1.0"
});

server.tool(
  "everything_search",
  "Search local Everything index. Read-only. Returns bounded file and folder paths.",
  EverythingSearchToolInputSchema.shape,
  async (input) =>
    runEverythingSearch(input, client, {
      defaultCount: config.defaultCount,
      maxCount: config.maxCount
    })
);

server.tool(
  "everything_health",
  "Check whether the Everything HTTP Server is reachable.",
  {},
  async () => runEverythingHealth(client)
);

const transport = new StdioServerTransport();
await server.connect(transport);
