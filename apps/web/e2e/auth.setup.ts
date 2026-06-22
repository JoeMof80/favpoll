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
 * The test account must be an existing Clerk user with email + password
 * auth enabled (not OAuth-only). Create it once via the Clerk dashboard or
 * the sign-up page, then add the credentials to secrets.
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
  // Clerk renders an email input first. After submitting, it transitions to
  // a password step. Selectors target standard Clerk UI (cl-* class elements).
  // If your Clerk instance uses a different strategy (OTP, OAuth-only), adjust
  // the selectors below or switch to @clerk/testing programmatic tokens.
  const emailInput = page
    .getByRole("textbox", { name: /email/i })
    .or(page.locator("#identifier-field"))

  await emailInput.fill(email)
  await page.getByRole("button", { name: /continue/i }).click()

  // ── Password step ───────────────────────────────────────────────────────────
  const passwordInput = page
    .getByRole("textbox", { name: /password/i })
    .or(page.locator("#password-field"))
    .or(page.locator('[type="password"]'))

  await passwordInput.fill(password)
  // Target Clerk's primary form submit button via its stable data attribute.
  // Using getByRole("button") with a name pattern here risks matching the
  // site header's "Sign in" nav button, which is also visible at this step.
  await page.locator('[data-localization-key="formButtonPrimary"]').click()

  // ── Verify auth succeeded ───────────────────────────────────────────────────
  // Wait until we're redirected away from the sign-in page
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 })

  mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
  await page.context().storageState({ path: AUTH_STATE_PATH })
  console.log(`[auth.setup] ✓ Signed in as ${email}`)
})
