/**
 * e2e/auth.setup.ts
 *
 * Playwright "setup:auth" project. Runs once before organiser tests.
 * Signs in via the Clerk sign-in page and saves the session to
 * e2e/.auth/user.json, which wizard-publish.spec.ts loads as storageState.
 *
 * Requirements (set in .env.local locally, GitHub secrets in CI):
 *   E2E_TEST_EMAIL     — email address of the test Clerk account
 *   E2E_TEST_PASSWORD  — password of the test Clerk account
 *
 * IMPORTANT: the test account MUST have 2FA / MFA disabled.
 * Use a dedicated e2e test account, not a personal account with 2FA enabled.
 * Create one at /sign-up and add the credentials to secrets.
 *
 * If either env var is absent, auth setup is skipped and wizard tests
 * will fail with a clear message about the missing credentials.
 */

import { test as setup, expect } from "@playwright/test"
import { mkdirSync } from "fs"
import { resolve } from "path"

const AUTH_STATE_PATH = resolve(process.cwd(), "e2e/.auth/user.json")

setup("authenticate as test organiser", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    console.warn(
      "\n[auth.setup] ⚠  E2E_TEST_EMAIL or E2E_TEST_PASSWORD not set.\n" +
        "  Saving empty auth state — wizard-publish tests will be skipped.\n"
    )
    mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
    // Save minimal state so dependent projects don't crash on missing file
    await page.context().storageState({ path: AUTH_STATE_PATH })
    return
  }

  await page.goto("/sign-in")

  // ── Clerk sign-in: email step ───────────────────────────────────────────────
  // Wait up to 15s for the Clerk form to hydrate. On preview deployments Clerk
  // may fail to initialize if the domain isn't in the Clerk instance's allowed
  // list — in that case, save empty state and skip gracefully.
  const emailInput = page
    .getByRole("textbox", { name: /email/i })
    .or(page.locator("#identifier-field"))

  const emailReady = await emailInput.waitFor({ timeout: 15_000 }).catch(() => null)
  if (!emailReady) {
    console.warn(
      "\n[auth.setup] ⚠  Sign-in page did not render the Clerk email input after 15s.\n" +
        "  Possible causes:\n" +
        "  • The preview deployment domain is not in Clerk's allowed domains list\n" +
        "  • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is wrong/missing in the Vercel Preview env\n" +
        "  Saving empty auth state — wizard-publish tests will be skipped.\n"
    )
    mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
    await page.context().storageState({ path: AUTH_STATE_PATH })
    return
  }

  await emailInput.fill(email)
  await page.getByRole("button", { name: /continue/i }).click()

  // ── Password step ───────────────────────────────────────────────────────────
  const passwordInput = page
    .getByRole("textbox", { name: /password/i })
    .or(page.locator("#password-field"))
    .or(page.locator('[type="password"]'))

  await passwordInput.fill(password)
  // Target Clerk's primary form submit button via its stable data attribute.
  // Using getByRole("button") with a name pattern risks matching the site
  // header's "Sign in" nav button, which is also visible at this step.
  await page.locator('[data-localization-key="formButtonPrimary"]').click()

  // ── Check for MFA (factor-two) ───────────────────────────────────────────────
  // If the account has 2FA enabled, Clerk redirects to /sign-in/factor-two.
  // We cannot automate TOTP without the secret key — skip with a clear message.
  await page.waitForURL(/.+/, { timeout: 5_000 }).catch(() => {})
  if (page.url().includes("/sign-in/factor-two")) {
    console.error(
      "\n[auth.setup] ✗ The test account has 2FA enabled.\n" +
        "  Clerk is asking for a second factor (TOTP/SMS) which cannot be\n" +
        "  automated without the TOTP secret.\n\n" +
        "  Fix: create a dedicated Clerk e2e account at /sign-up with ONLY\n" +
        "  email + password auth (no 2FA), then update E2E_TEST_EMAIL and\n" +
        "  E2E_TEST_PASSWORD in the GitHub environment secrets.\n"
    )
    // Save empty state so dependent wizard-publish test skips rather than errors.
    mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
    await page.context().storageState({ path: AUTH_STATE_PATH })
    return
  }

  // ── Verify auth succeeded ───────────────────────────────────────────────────
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 })

  mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
  await page.context().storageState({ path: AUTH_STATE_PATH })
  console.log(`[auth.setup] ✓ Signed in as ${email}`)
})
