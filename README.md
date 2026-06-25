# voidtools-everything-mcp

Local MCP server for searching a voidtools Everything 1.5a index from Codex, Claude, and other MCP clients.

This server uses the Everything HTTP Server and exposes read-only MCP tools. It does not download, open, modify, delete, rebuild, or reindex files.

## Requirements

- Windows with Everything 1.5a running.
- Everything HTTP Server enabled.
- Node.js 20.11 or newer.

## Recommended Everything Settings

In Everything:

1. Open Tools > Options > HTTP Server.
2. Enable HTTP Server.
3. Note the port. The official default URL is `http://127.0.0.1`, while this machine is currently serving Everything HTTP on `http://127.0.0.1:8011`.
4. Disable file download unless you explicitly need browser downloads.
5. Keep the HTTP Server off public networks.

## Install

```powershell
npm install
npm run build
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `EVERYTHING_BASE_URL` | `http://127.0.0.1` | Everything HTTP Server URL |
| `EVERYTHING_DEFAULT_COUNT` | `20` | Default returned result count |
| `EVERYTHING_MAX_COUNT` | `100` | Maximum returned result count |
| `EVERYTHING_TIMEOUT_MS` | `5000` | HTTP timeout in milliseconds |

## Claude Desktop Example

```json
{
  "mcpServers": {
    "everything": {
      "command": "node",
      "args": [
        "C:\\Users\\KU\\project\\Everything-SDK\\dist\\index.js"
      ],
      "env": {
        "EVERYTHING_BASE_URL": "http://127.0.0.1:8011"
      }
    }
  }
}
```

## Tools

### `everything_search`

Searches the Everything index and returns bounded file/folder paths.

Input:

```json
{
  "query": "invoice ext:pdf",
  "count": 20,
  "sort": "date_modified",
  "ascending": false,
  "matchPath": true
}
```

### `everything_health`

Checks whether the Everything HTTP Server is reachable.

## Development

```powershell
npm test
npm run typecheck
npm run build
```

## Security Notes

- Keep Everything HTTP Server bound to localhost for personal agent usage.
- Do not expose the HTTP Server to a public network.
- Add authentication, path allowlists, and audit logging before any remote deployment.
- Add a separate allowlisted file-reading tool only if an agent truly needs file contents.

## License

MIT
