import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = join(process.cwd(), "..");

function read(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function serviceBlock(compose: string, serviceName: string) {
  const lines = compose.split("\n");
  const start = lines.findIndex((line) => line === `  ${serviceName}:`);
  if (start === -1) return "";
  const next = lines.findIndex((line, index) => index > start && /^  [a-zA-Z0-9_-]+:/.test(line));
  return lines.slice(start, next === -1 ? undefined : next).join("\n");
}

describe("SPEC-C security surface", () => {
  test("admin login redirects are relative and independent from host or forwarded headers", () => {
    const route = read("biblioteca/app/api/admin/login/route.ts");

    expect(route).not.toMatch(/x-forwarded-host|x-forwarded-proto|getPublicOrigin|headers\.get\("host"/);
    expect(route).toContain('Location: path');
    expect(route).toContain('redirectTo("/biblioteca/admin/login?error=1")');
    expect(route).toContain('redirectTo("/biblioteca/admin")');
  });

  test("admin logout redirect is relative and independent from host or forwarded headers", () => {
    const route = read("biblioteca/app/api/admin/logout/route.ts");

    expect(route).not.toMatch(/x-forwarded-host|x-forwarded-proto|getPublicOrigin|headers\.get\("host"/);
    expect(route).toContain('Location: "/biblioteca/admin/login"');
  });

  test("biblioteca_web runtime does not receive the bootstrap password and does not publish port 3000", () => {
    const block = serviceBlock(read("docker-compose.yml"), "biblioteca_web");

    expect(block).toContain('expose:\n      - "3000"');
    expect(block).not.toMatch(/\n\s+ports:/);
    expect(block).not.toContain("env_file:");
    expect(block).not.toContain("BIBLIOTECA_ADMIN_PASSWORD");
  });

  test("caddy remains the public entrypoint for biblioteca", () => {
    const compose = read("docker-compose.yml");
    const caddyBlock = serviceBlock(compose, "caddy");
    const caddyfile = read("Caddyfile");

    expect(caddyBlock).toContain('"80:80"');
    expect(caddyBlock).toContain('"443:443"');
    expect(caddyfile).toContain("handle /biblioteca*");
    expect(caddyfile).toContain("reverse_proxy biblioteca_web:3000");
  });

  test("admin seed still requires an explicit bootstrap password and hashes it", () => {
    const seed = read("biblioteca/scripts/seed-admin.ts");

    expect(seed).toContain("process.env.BIBLIOTECA_ADMIN_PASSWORD");
    expect(seed).toContain("if (!email || !password)");
    expect(seed).toContain("argon2.hash(password, { type: argon2.argon2id })");
    expect(seed).not.toMatch(/password\s*=\s*["'][^"']+["']/);
  });
});
