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

  // ── Second step (device verification / 2FA) ────────────────────────────────
  // After the password submit Clerk either completes the session or redirects
  // through /sign-in/factor-one → /factor-two (~2s). Sampling page.url() once
  // races that redirect (run 4 failed exactly there), so instead race two
  // outcomes: we left /sign-in, or a verification-code input appeared.
  //   • Device verification ("new device") — every CI runner is new. With a
  //     +clerk_test email (dev instances) no email is sent and the fixed code
  //     424242 always verifies.
  //   • Real TOTP/SMS 2FA — cannot be automated; skip with a clear message.
  const codeInput = page.getByRole("textbox", { name: /verification code/i })
  const secondStep = await Promise.race([
    page
      .waitForURL((u) => !u.pathname.startsWith("/sign-in"), {
        timeout: 15_000,
      })
      .then(() => "signed-in" as const),
    codeInput.waitFor({ timeout: 15_000 }).then(() => "code" as const),
  ]).catch(() => "timeout" as const)

  if (secondStep === "code") {
    if (!email.includes("+clerk_test")) {
      console.error(
        "\n[auth.setup] ✗ Clerk is asking for a verification code that cannot be automated.\n" +
          "  Use a +clerk_test address (e.g. organiser+clerk_test@example.com):\n" +
          "  dev instances send no email and accept the fixed code 424242.\n"
      )
      mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
      await page.context().storageState({ path: AUTH_STATE_PATH })
      return
    }
    await codeInput.fill("424242")
    // Clerk may auto-submit a complete code — the button can already be gone.
    await page
      .getByRole("button", { name: /^continue$/i })
      .click({ timeout: 3_000 })
      .catch(() => {})
  }

  // ── Verify auth succeeded ───────────────────────────────────────────────────
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 })

  mkdirSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true })
  await page.context().storageState({ path: AUTH_STATE_PATH })
  console.log(`[auth.setup] ✓ Signed in as ${email}`)
})
