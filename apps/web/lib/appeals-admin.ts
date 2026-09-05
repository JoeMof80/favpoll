// TEMPORARY appeals-management gate (founder, 2026-09-05: "build it in
// the main app and restrict access temporarily"). The creation/editing
// pages ARE the future charity portal's core; when charity accounts
// exist, this env allowlist becomes a charity-role check and nothing
// else moves. Server-side only.
export function canManageAppeals(userId: string | null): boolean {
  if (!userId) return false
  const allow = (process.env.APPEALS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return allow.includes(userId)
}
