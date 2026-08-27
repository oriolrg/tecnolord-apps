import { describe, expect, test } from "vitest";
import { authorizeAdmin } from "../lib/biblioteca/authorization";

describe("admin authorization", () => {
  test("rejects API access without a session user as 401", () => {
    expect(authorizeAdmin(null)).toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized"
    });
  });

  test("rejects disabled users as 401", () => {
    expect(authorizeAdmin({ status: "disabled", role: "admin" })).toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized"
    });
  });

  test("rejects active non-admin users as 403", () => {
    expect(authorizeAdmin({ status: "active", role: "editor" })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });
  });

  test("allows active administrators", () => {
    expect(authorizeAdmin({ status: "active", role: "admin" })).toEqual({
      ok: true
    });
  });
});
