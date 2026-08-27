type AdminCandidate = {
  status: "active" | "disabled";
  role: "admin" | "editor";
} | null;

export type AdminAuthorization =
  | { ok: true }
  | { ok: false; status: 401; error: "Unauthorized" }
  | { ok: false; status: 403; error: "Forbidden" };

export function authorizeAdmin(user: AdminCandidate): AdminAuthorization {
  if (!user || user.status !== "active") {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (user.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true };
}
