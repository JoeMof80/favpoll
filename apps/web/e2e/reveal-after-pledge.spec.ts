/**
 * e2e/reveal-after-pledge.spec.ts  —  HIGHEST PRIORITY
 *
 * Tests the full guest pledge → reveal flow on the favpoll public page.
 * This is the test that would have caught the PR #120 bug immediately:
 * personal_reveal was null on every seeded favpoll due to a wrong
 * placeholder lookup key, and this went undetected through unit tests.
 *
 * Test favpoll:
 *   Created by global-setup.ts (protagonist: "E2E Playwright Test",
 *   topic: Colour, charity: Marie Curie, reveal: known fixed text).
 *   Open (closes_at = 90 days from now). Unauthenticated guest flow.
 *
 * Stripe:
 *   Uses test card 4242 4242 4242 4242 (always succeeds).
 *   Stripe test-mode keys must be present in the running app.
 *
 * Assertion strategy:
 *   The reveal blockquote (role="status") is asserted visible and non-empty.
 *   The known key phrase "Cornflower blue" is also checked — this is
 *   fixed test-fixture content so exact-phrase matching is appropriate.
 *
 * Prerequisites:
 *   - global-setup.ts must have written e2e/.state/fixtures.json
 *   - PLAYWRIGHT_BASE_URL (or local dev server) must be running
 *   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a Stripe test-mode key
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "fs"
import { resolve } from "path"

// ── Load fixture state written by global-setup ────────────────────────────────
let openFavpollId: string
let revealText: string

test.beforeAll(() => {
  try {
    const state = JSON.parse(
      readFileSync(resolve(process.cwd(), "e2e/.state/fixtures.json"), "utf-8")
    )
    openFavpollId = state.openFavpollId
    revealText = state.revealText
  } catch {
    // Will surface as a skip in individual tests
  }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("reveal after pledge", () => {
  test("reveal is hidden before pledging and visible with correct text after payment", async ({
    page,
  }) => {
    if (!openFavpollId) {
      test.skip(
        true,
        "Test favpoll fixture not available. " +
          "Check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set " +
          "and global-setup.ts ran successfully."
      )
    }

    // ── 1. Navigate to the test favpoll public page ───────────────────────────
    await page.goto(`/favpolls/${openFavpollId}`)
    await page.waitForLoadState("domcontentloaded")

    // ── 2. Confirm reveal is NOT visible before pledging ─────────────────────
    // The reveal blockquote has role="status" and is conditionally rendered
    // only after a pledge is confirmed (PollSection's pledged state).
    await expect(page.getByRole("status")).not.toBeVisible()
    await expect(page.getByText("Cornflower blue")).not.toBeVisible()

    // ── 3. Open the pledge dialog ─────────────────────────────────────────────
    const pledgeButton = page.getByRole("button", {
      name: /pledge favourites/i,
    })
    await expect(pledgeButton).toBeVisible()
    await pledgeButton.click()

    // Dialog opens (ResponsiveOverlay renders as Dialog on desktop)
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(/choose your favourite/i)

    // ── 4. Step 1: Pick a favourite ───────────────────────────────────────────
    // Colour is a finite topic. Chips render as <button aria-pressed="false|true">,
    // not radio inputs — use [aria-pressed] to locate them.
    const chips = dialog.locator("[aria-pressed]")
    const firstChip = chips.first()
    await expect(firstChip).toBeVisible({ timeout: 10_000 })
    await firstChip.click()
    await expect(firstChip).toHaveAttribute("aria-pressed", "true")

    // Advance to step 2
    await dialog.getByRole("button", { name: /next/i }).click()

    // ── 5. Step 2: Set pledge amount ──────────────────────────────────────────
    // Preset amounts render as plain <Button> elements (£5, £10, £20, £50).
    // Click the smallest preset; no checked state to assert.
    await expect(dialog).toContainText(/your pledge/i, { timeout: 10_000 })
    const firstPreset = dialog.getByRole("button", { name: "£5", exact: true })
    await expect(firstPreset).toBeVisible()
    await firstPreset.click()

    // "Pledge" button creates the Stripe PaymentIntent and advances to step 3
    await dialog.getByRole("button", { name: /^pledge$/i }).click()

    // ── 6. Step 3: Complete Stripe payment ────────────────────────────────────
    // StepPay renders StripeCheckout inline=true, with showEmailCapture=true
    // because clerkUserId is null for an unauthenticated guest.
    await expect(dialog).toContainText(/complete payment/i, { timeout: 15_000 })

    // Guest email — rendered above the Stripe PaymentElement
    const emailInput = dialog.getByLabel(
      "Email address for receipt and withdrawal link"
    )
    await expect(emailInput).toBeVisible({ timeout: 15_000 })
    await emailInput.fill("e2e-test@playwright.test")

    // ── Stripe PaymentElement iframes ──────────────────────────────────────
    // Stripe renders card fields inside hosted iframes. The iframe title and
    // layout vary by Stripe.js version:
    //   • Unified (old CardElement / some PaymentElement):
    //       1 iframe titled "Secure payment input frame" — all fields inside
    //   • Split-field (modern PaymentElement):
    //       3 iframes per field, each titled "Secure card number input frame",
    //       "Secure expiry date input frame", "Secure CVC input frame" etc.
    // We wait for any "Secure *" iframe and use count to detect the layout.

    // Broad wait — any iframe whose title starts with "Secure"
    await page
      .locator('iframe[title*="Secure"]')
      .first()
      .waitFor({ timeout: 25_000 })
      .catch(async () => {
        const iframes = await page.$$eval("iframe", (els) =>
          (els as HTMLIFrameElement[]).map((el) => ({
            t: el.title,
            n: el.name.substring(0, 60),
            s: el.src.substring(0, 80),
          }))
        )
        console.error("[e2e] No Stripe iframe found after 25s.")
        console.error("[e2e] All iframes on page:", JSON.stringify(iframes))
        console.error(
          "[e2e] Check that NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set to a valid " +
            "Stripe test-mode publishable key in the Vercel Preview environment."
        )
        throw new Error(
          "[e2e] Stripe PaymentElement iframe not found — see log above"
        )
      })

    // Log actual iframe titles for CI diagnostics on any future mismatch
    const iframeInfo = await page.$$eval("iframe", (els) =>
      (els as HTMLIFrameElement[]).map((el) => ({
        t: el.title,
        n: el.name.substring(0, 60),
      }))
    )
    console.log("[e2e] Stripe iframes:", JSON.stringify(iframeInfo))

    // Stripe renders 1–3 "Secure *" iframes. A Link/wallet selector iframe
    // (also titled "Secure payment input frame") may appear BEFORE the actual
    // card-form iframe. Scan each Secure iframe until the card number field
    // is found, polling up to 20s for all iframes to fully mount.
    const secureIframes = page.locator('iframe[title*="Secure"]')

    // Selectors used to identify which iframe has the card number field
    const CARD_SEL =
      '[autocomplete="cc-number"], input[aria-label="Card number"], ' +
      'input[placeholder="1234 1234 1234 1234"], input[placeholder="Card number"]'

    let cardFrameIdx = -1
    const scanDeadline = Date.now() + 20_000
    while (Date.now() < scanDeadline && cardFrameIdx < 0) {
      const n = await secureIframes.count()
      console.log(`[e2e] Scanning ${n} Secure iframe(s) for card number input`)
      for (let i = 0; i < n; i++) {
        const hasCard = await secureIframes
          .nth(i)
          .contentFrame()
          .locator(CARD_SEL)
          .count()
          .then((c) => c > 0)
          .catch(() => false)
        if (hasCard) {
          cardFrameIdx = i
          console.log(`[e2e] Card number found in Secure iframe ${i} of ${n}`)
          break
        }
      }
      if (cardFrameIdx < 0) await page.waitForTimeout(500)
    }

    if (cardFrameIdx < 0) {
      // Dump inputs from every Secure iframe to diagnose the mismatch
      const n = await secureIframes.count()
      for (let i = 0; i < n; i++) {
        const inputs = await secureIframes
          .nth(i)
          .contentFrame()
          .locator("input")
          .evaluateAll((els) =>
            (els as HTMLInputElement[]).map((el) => ({
              n: el.name,
              ph: el.placeholder,
              ac: el.autocomplete,
              al: el.getAttribute("aria-label"),
            }))
          )
          .catch(() => [])
        console.error(
          `[e2e] Secure iframe ${i} inputs:`,
          JSON.stringify(inputs)
        )
      }
      throw new Error(
        "[e2e] Card number not found in any Secure iframe after 20s — check logs above"
      )
    }

    const cardFrame = secureIframes.nth(cardFrameIdx).contentFrame()
    const secureTotal = await secureIframes.count()

    // Fill card number
    await cardFrame.locator(CARD_SEL).first().fill("4242424242424242")

    // Expiry: same iframe (unified) or next iframe (split-field)
    const expiryFrame =
      secureTotal > cardFrameIdx + 1
        ? secureIframes.nth(cardFrameIdx + 1).contentFrame()
        : cardFrame
    await expiryFrame
      .locator('[autocomplete="cc-exp"], input[placeholder="MM / YY"]')
      .first()
      .fill("12/34")

    // CVC: same iframe (unified) or next+1 iframe (split-field)
    const cvcFrame =
      secureTotal > cardFrameIdx + 2
        ? secureIframes.nth(cardFrameIdx + 2).contentFrame()
        : cardFrame
    await cvcFrame
      .locator('[autocomplete="cc-csc"], input[placeholder="CVC"]')
      .first()
      .fill("123")

    // Postal code — optional
    const postalInput = cardFrame.locator('input[placeholder="ZIP"]').first()
    if (
      (await postalInput.count()) > 0 &&
      (await postalInput.isVisible().catch(() => false))
    ) {
      await postalInput.fill("10001")
    }

    // Submit via the external "Pay now" button in the dialog footer.
    // This submits form#pledge-checkout-form which Stripe's Elements handles.
    await dialog.getByRole("button", { name: /pay now/i }).click()

    // ── 7. Wait for payment to succeed and dialog to close ────────────────────
    // Stripe test-mode cards process synchronously (redirect: "if_required"
    // and 4242 never triggers 3DS, so no redirect occurs).
    await expect(dialog).not.toBeVisible({ timeout: 30_000 })

    // ── 8. Confirm the reveal is now visible ──────────────────────────────────
    // PledgeDialog.onPledgeSuccess → FavpollContent.handlePledgeSuccess →
    // pledgeConfirmed = true → PollSection switches to results view →
    // PollReveal renders with role="status" aria-live="polite".
    //
    // THIS IS THE ASSERTION THAT WOULD HAVE CAUGHT PR #120's BUG.
    // personal_reveal was null → PollReveal returns null → no blockquote rendered.
    const revealBlock = page.getByRole("status")
    await expect(revealBlock).toBeVisible({ timeout: 10_000 })
    await expect(revealBlock).not.toBeEmpty()

    // Verify the specific reveal content (fixed test-fixture text)
    await expect(
      page.getByText("Cornflower blue", { exact: false })
    ).toBeVisible()
    await expect(page.getByText(revealText, { exact: false })).toBeVisible()

    // ── 9. Confirm results ranking is visible ─────────────────────────────────
    // After pledging, the poll switches to results view and renders a RankingList
    const rankingList = page.getByRole("list", { name: /results/i })
    await expect(rankingList).toBeVisible({ timeout: 10_000 })
  })
})
