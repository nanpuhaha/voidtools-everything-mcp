import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses safe localhost defaults", () => {
    const config = loadConfig({});

    expect(config.baseUrl).toBe("http://127.0.0.1");
    expect(config.defaultCount).toBe(20);
    expect(config.maxCount).toBe(100);
    expect(config.timeoutMs).toBe(5000);
  });

  it("accepts explicit environment values", () => {
    const config = loadConfig({
      EVERYTHING_BASE_URL: "http://localhost:9090",
      EVERYTHING_DEFAULT_COUNT: "10",
      EVERYTHING_MAX_COUNT: "50",
      EVERYTHING_TIMEOUT_MS: "1500"
    });

    expect(config.baseUrl).toBe("http://localhost:9090");
    expect(config.defaultCount).toBe(10);
    expect(config.maxCount).toBe(50);
    expect(config.timeoutMs).toBe(1500);
  });

  it("rejects non-http base URLs", () => {
    expect(() =>
      loadConfig({ EVERYTHING_BASE_URL: "file:///C:/Windows" })
    ).toThrow("EVERYTHING_BASE_URL must use http or https");
  });

  it("rejects invalid count bounds", () => {
    expect(() =>
      loadConfig({
        EVERYTHING_DEFAULT_COUNT: "200",
        EVERYTHING_MAX_COUNT: "100"
      })
    ).toThrow(
      "EVERYTHING_DEFAULT_COUNT must be less than or equal to EVERYTHING_MAX_COUNT"
    );
  });
});
