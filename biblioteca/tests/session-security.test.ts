import { afterEach, describe, expect, test, vi } from "vitest";
import {
  getCsrfCookieOptions,
  getSessionCookieOptions,
  hashSessionTokenForStorage
} from "../lib/biblioteca/auth";

describe("session security helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("stores a one-way SHA-256 derivative instead of the clear session token", () => {
    const token = "captured-session-token";
    const tokenHash = hashSessionTokenForStorage(token);

    expect(tokenHash).not.toBe(token);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionTokenForStorage(token)).toBe(tokenHash);
  });

  test("sets secure session cookie attributes in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const expires = new Date("2026-09-10T10:00:00.000Z");

    expect(getSessionCookieOptions(expires)).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/biblioteca",
      expires
    });
  });

  test("uses matching paths when clearing session and csrf cookies", () => {
    const expires = new Date(0);

    expect(getSessionCookieOptions(expires).path).toBe("/biblioteca");
    expect(getCsrfCookieOptions(expires).path).toBe("/biblioteca");
  });
});
