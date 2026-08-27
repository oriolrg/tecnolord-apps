import { describe, expect, test } from "vitest";
import {
  getRetryAfterSeconds,
  LOGIN_IDENTITY_RATE_LIMIT_POLICY,
  nextFailedLoginState,
  normalizeLoginIdentity
} from "../lib/biblioteca/login-rate-limit";

describe("login rate limit policy", () => {
  test("normalizes login identity like the login lookup", () => {
    expect(normalizeLoginIdentity("  Admin@Tecnolord.CAT ")).toBe("admin@tecnolord.cat");
  });

  test("counts failed attempts inside the same window", () => {
    const now = new Date("2026-08-27T10:00:00.000Z");
    const first = nextFailedLoginState(null, now);
    const second = nextFailedLoginState(first, new Date("2026-08-27T10:01:00.000Z"));

    expect(first).toMatchObject({
      failedCount: 1,
      windowStartedAt: now,
      blockedUntil: null
    });
    expect(second).toMatchObject({
      failedCount: 2,
      windowStartedAt: now,
      blockedUntil: null
    });
  });

  test("blocks after the fifth failed attempt by identity", () => {
    const now = new Date("2026-08-27T10:00:00.000Z");
    let state = nextFailedLoginState(null, now);

    for (let index = 1; index < LOGIN_IDENTITY_RATE_LIMIT_POLICY.maxFailures; index += 1) {
      state = nextFailedLoginState(state, new Date(now.getTime() + index * 1000));
    }

    expect(state.failedCount).toBe(5);
    expect(state.blockedUntil?.toISOString()).toBe("2026-08-27T10:15:04.000Z");
  });

  test("keeps a blocked state unchanged until the block expires", () => {
    const blockedUntil = new Date("2026-08-27T10:15:00.000Z");
    const state = nextFailedLoginState(
      {
        failedCount: 5,
        windowStartedAt: new Date("2026-08-27T10:00:00.000Z"),
        blockedUntil
      },
      new Date("2026-08-27T10:10:00.000Z")
    );

    expect(state.failedCount).toBe(5);
    expect(state.blockedUntil).toBe(blockedUntil);
  });

  test("starts a new window after the previous window expires", () => {
    const state = nextFailedLoginState(
      {
        failedCount: 4,
        windowStartedAt: new Date("2026-08-27T10:00:00.000Z"),
        blockedUntil: null
      },
      new Date("2026-08-27T10:16:00.000Z")
    );

    expect(state.failedCount).toBe(1);
    expect(state.windowStartedAt.toISOString()).toBe("2026-08-27T10:16:00.000Z");
    expect(state.blockedUntil).toBeNull();
  });

  test("reports retry-after in seconds without returning zero", () => {
    expect(getRetryAfterSeconds(new Date("2026-08-27T10:15:00.000Z"), new Date("2026-08-27T10:14:59.500Z"))).toBe(1);
  });
});
