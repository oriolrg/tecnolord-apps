import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("admin security surface", () => {
  test("protected admin pages enforce server-side admin checks", () => {
    const pages = [
      "app/admin/page.tsx",
      "app/admin/articles/new/page.tsx",
      "app/admin/articles/[id]/page.tsx"
    ];

    for (const page of pages) {
      expect(read(page)).toContain("requireAdminPage");
    }
  });

  test("admin APIs except login enforce API authorization without relying on redirects", () => {
    const routes = [
      "app/api/admin/logout/route.ts",
      "app/api/admin/articles/route.ts",
      "app/api/admin/articles/[id]/route.ts",
      "app/api/admin/articles/[id]/attachments/route.ts",
      "app/api/admin/articles/[id]/attachments/[attachmentId]/route.ts"
    ];

    for (const route of routes) {
      expect(read(route)).toContain("requireAdminApi");
    }
  });

  test("admin resource APIs do not redirect unauthorized clients to HTML login", () => {
    const routes = [
      "app/api/admin/articles/route.ts",
      "app/api/admin/articles/[id]/route.ts",
      "app/api/admin/articles/[id]/attachments/route.ts",
      "app/api/admin/articles/[id]/attachments/[attachmentId]/route.ts"
    ];

    for (const route of routes) {
      expect(read(route)).toContain("requireAdminApi");
      expect(read(route)).not.toContain("redirect(");
    }
  });

  test("admin mutations keep CSRF checks", () => {
    const routes = [
      "app/api/admin/logout/route.ts",
      "app/api/admin/articles/route.ts",
      "app/api/admin/articles/[id]/route.ts",
      "app/api/admin/articles/[id]/attachments/route.ts",
      "app/api/admin/articles/[id]/attachments/[attachmentId]/route.ts"
    ];

    for (const route of routes) {
      expect(read(route).toLowerCase()).toMatch(/assertcsrf|csrftoken|getcsrftoken/);
    }
  });
});
