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

## Local Development Install

```powershell
git clone <this-repository-url>
cd voidtools-everything-mcp
npm install
npm run build
```

During local development, configure your MCP client to run the built local file with `node`. MCP clients start this process on demand and communicate with it over stdio; you do not need to keep this server running manually.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `EVERYTHING_BASE_URL` | `http://127.0.0.1` | Everything HTTP Server URL |
| `EVERYTHING_DEFAULT_COUNT` | `20` | Default returned result count |
| `EVERYTHING_MAX_COUNT` | `100` | Maximum returned result count |
| `EVERYTHING_TIMEOUT_MS` | `5000` | HTTP timeout in milliseconds |

## Local MCP Client Example

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

Use an absolute path in `args`. Many MCP clients launch the command directly without a shell, so variables such as `%USERPROFILE%`, `$env:USERPROFILE`, or `~` may not be expanded inside `args`. If your MCP client explicitly documents environment-variable expansion in command arguments, you can use it; otherwise the absolute path is the safest option.

If you move this repository to `C:\Users\KU\project\voidtools-everything-mcp`, update the path like this:

```json
{
  "mcpServers": {
    "everything": {
      "command": "node",
      "args": [
        "C:\\Users\\KU\\project\\voidtools-everything-mcp\\dist\\index.js"
      ],
      "env": {
        "EVERYTHING_BASE_URL": "http://127.0.0.1:8011"
      }
    }
  }
}
```

## npm Package Usage

After this package is published to npm, MCP clients can run it with `npx` instead of a local path:

```json
{
  "mcpServers": {
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "voidtools-everything-mcp"
      ],
      "env": {
        "EVERYTHING_BASE_URL": "http://127.0.0.1:8011"
      }
    }
  }
}
```

With this setup, the MCP client starts `npx` only when it needs the MCP server. `npx` downloads or reuses the package from the npm cache, runs the package binary locally, and the process exits when the MCP client disconnects.

## Publishing

This package is set up for npm Trusted Publishing from GitHub Actions. The workflow lives at `.github/workflows/publish.yml` and publishes when a `v*` tag is pushed.

### One-time npm setup

1. Push this repository to GitHub.
2. Create the package name on npm, or publish the first version manually once with `npm publish --access public`.
3. Open the package page on npmjs.com.
4. Go to package settings and find **Trusted Publisher**.
5. Choose **GitHub Actions**.
6. Fill in:
   - Organization or user: your GitHub username or organization.
   - Repository: the GitHub repository name.
   - Workflow filename: `publish.yml`.
   - Environment name: leave blank unless you add a GitHub deployment environment.
   - Allowed actions: `npm publish`.

Trusted Publishing uses GitHub Actions OIDC, so you do not need to create an `NPM_TOKEN` secret.

### Release a new version

```powershell
npm version patch
git push
git push origin --tags
```

The pushed `v*` tag starts the publish workflow. The workflow installs dependencies, runs tests, typechecks, builds, shows `npm pack --dry-run`, and then runs `npm publish --access public`.

For a minor or major release, use `npm version minor` or `npm version major`.

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
