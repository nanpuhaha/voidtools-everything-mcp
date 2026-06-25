export type EverythingMcpConfig = {
  baseUrl: string;
  defaultCount: number;
  maxCount: number;
  timeoutMs: number;
};

type Env = Record<string, string | undefined>;

function readPositiveInt(env: Env, key: string, fallback: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }

  return parsed;
}

export function loadConfig(env: Env = process.env): EverythingMcpConfig {
  const baseUrl = env.EVERYTHING_BASE_URL ?? "http://127.0.0.1";
  const parsedUrl = new URL(baseUrl);

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("EVERYTHING_BASE_URL must use http or https");
  }

  const defaultCount = readPositiveInt(env, "EVERYTHING_DEFAULT_COUNT", 20);
  const maxCount = readPositiveInt(env, "EVERYTHING_MAX_COUNT", 100);
  const timeoutMs = readPositiveInt(env, "EVERYTHING_TIMEOUT_MS", 5000);

  if (defaultCount > maxCount) {
    throw new Error(
      "EVERYTHING_DEFAULT_COUNT must be less than or equal to EVERYTHING_MAX_COUNT"
    );
  }

  return {
    baseUrl: parsedUrl.toString().replace(/\/$/, ""),
    defaultCount,
    maxCount,
    timeoutMs
  };
}
