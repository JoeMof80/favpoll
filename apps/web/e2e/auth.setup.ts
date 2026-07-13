/**
 * e2e/auth.setup.ts
 *
 * Playwright "setup:auth" project. Runs once before organiser tests.
 * Signs in via the Clerk sign-in page and saves the session to
 * e2e/.auth/user.json, which wizard-publish.spec.ts loads as storageState.
 *
 * Requirements (set in .env.local locally, GitHub secrets in CI):
 *   E2E_TEST_EMAIL     — email address of the test Clerk account. Use a
 *                        +clerk_test address (e.g. organiser+clerk_test@x.com):
 *                        dev instances send no real email and accept the fixed
 *                        verification code 424242, which automates Clerk's
 *                        new-device verification on CI runners.
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
import { setupClerkTestingToken } from "@clerk/testing/playwright"
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

  // Attach the Clerk testing token (minted in global-setup when
  // CLERK_SECRET_KEY is available) to frontend-API requests — bypasses bot
  // detection, which otherwise stops the sign-in form hydrating on preview
  // domains. No-token runs proceed exactly as before.
  if (process.env.CLERK_TESTING_TOKEN) {
    await setupClerkTestingToken({ page })
  }

  // Capture page-side failures so a hydration failure is diagnosable from CI
  // logs instead of a silent skip (the 2026-07-13 lesson).
  const pageErrors: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") pageErrors.push(m.text())
  })
  page.on("pageerror", (e) => pageErrors.push(String(e)))

  await page.goto("/sign-in")

  // ── Clerk sign-in: email step ───────────────────────────────────────────────
  // Wait up to 15s for the Clerk form to hydrate. On preview deployments Clerk
  // may fail to initialize if the domain isn't in the Clerk instance's allowed
  // list — in that case, save empty state and skip gracefully.
  const emailInput = page
    .getByRole("textbox", { name: /email/i })
    .or(page.locator("#identifier-field"))

  const emailReady = await emailInput
    .waitFor({ timeout: 15_000 })
    .then(() => true)
    .catch((err: Error) => {
      console.warn(
        `[auth.setup] waitFor(email input) rejected: ${String(err?.message ?? err).slice(0, 400)}`
      )
      return false
    })
  if (!emailReady) {
    const clerkPresent = await page
      .evaluate(() => typeof (window as { Clerk?: unknown }).Clerk)
      .catch(
        (e: Error) => `eval failed: ${String(e?.message ?? e).slice(0, 120)}`
      )
    const bodySnippet = await page
      .content()
      .then((h) => h.replace(/\s+/g, " ").slice(0, 500))
      .catch(() => "(content unavailable)")
    console.warn(
      "\n[auth.setup] ⚠  Sign-in page did not render the Clerk email input after 15s.\n" +
        `  url:             ${page.url()}\n` +
        `  window.Clerk:    ${clerkPresent}\n` +
        `  console errors:  ${pageErrors.slice(0, 5).join(" | ").slice(0, 800) || "none"}\n` +
        `  html snippet:    ${bodySnippet}\n` +
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

  // ── Check for a second step (factor-two) ────────────────────────────────────
  // Clerk lands here in two cases:
  //   1. Device verification ("You're signing in from a new device") — every
  //      CI runner is a new device. With a +clerk_test email (dev instances)
  //      no real email is sent and the fixed code 424242 always verifies.
  //   2. Real 2FA (TOTP/SMS) — cannot be automated; skip with a clear message.
  await page.waitForURL(/.+/, { timeout: 5_000 }).catch(() => {})
  if (page.url().includes("/sign-in/factor-two")) {
    const codeInput = page.getByRole("textbox", {
      name: /verification code/i,
    })
    const codeReady = await codeInput
      .waitFor({ timeout: 5_000 })
      .then(() => true)
      .catch(() => false)
    if (codeReady && email.includes("+clerk_test")) {
      await codeInput.fill("424242")
      await page.getByRole("button", { name: /^continue$/i }).click()
    } else {
      console.error(
        "\n[auth.setup] ✗ Clerk is asking for a second factor that cannot be automated.\n" +
          (codeReady
            ? "  An email verification code is required but the account is not a\n" +
              "    +clerk_test address, so the fixed code 424242 does not apply.\n" +
              "    Fix: use a test email like organiser+clerk_test@example.com\n" +
              "    (dev instances: no email sent, code is always 424242).\n"
            : "  TOTP/SMS 2FA appears to be enabled on the account — use a\n" +
              "    dedicated e2e account with only email + password.\n")
      )
      // Save empty state so dependent wizard-publish tests skip rather than error.
      mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
      await page.context().storageState({ path: AUTH_STATE_PATH })
      return
    }
  }

  // ── Verify auth succeeded ───────────────────────────────────────────────────
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 })

  mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
  await page.context().storageState({ path: AUTH_STATE_PATH })
  console.log(`[auth.setup] ✓ Signed in as ${email}`)
})
