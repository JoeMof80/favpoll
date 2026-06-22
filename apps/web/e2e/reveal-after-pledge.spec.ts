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

import { test, expect, type Frame } from "@playwright/test"
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

    // ── Stripe PaymentElement: fill card fields ───────────────────────────
    // The PaymentElement renders an outer "Secure payment input frame" that
    // itself contains nested sub-iframes for each card field. A Link/wallet
    // check iframe (also titled "Secure payment input frame") may appear
    // briefly then vanish. Using contentFrame().locator("input") only
    // searches the first-level document and misses nested sub-frames.
    //
    // page.frames() traverses the FULL frame tree including nested iframes,
    // so we use it to poll until the card number input is found anywhere.

    // Wait for any Stripe-hosted "Secure *" iframe to appear first
    await page
      .locator('iframe[title*="Secure"]')
      .first()
      .waitFor({ timeout: 25_000 })
      .catch(async () => {
        const iframes = await page.$$eval("iframe", (els) =>
          (els as HTMLIFrameElement[]).map((el) => ({
            t: el.title,
            n: el.name.substring(0, 60),
          }))
        )
        console.error("[e2e] No Stripe iframe appeared after 25s:", iframes)
        throw new Error("[e2e] Stripe PaymentElement iframe not found")
      })

    // Log top-level iframe titles AND the full frame tree for diagnostics
    const topIframes = await page.$$eval("iframe", (els) =>
      (els as HTMLIFrameElement[]).map((el) => ({
        t: el.title,
        n: el.name.substring(0, 50),
      }))
    )
    console.log("[e2e] Top-level iframes:", JSON.stringify(topIframes))
    console.log(
      "[e2e] All frames (incl. nested):",
      JSON.stringify(
        page.frames().map((f) => ({
          name: f.name().substring(0, 50),
          url: f.url().substring(0, 70),
        }))
      )
    )

    const CARD_SEL =
      '[autocomplete="cc-number"], input[aria-label="Card number"], ' +
      'input[placeholder="1234 1234 1234 1234"], input[placeholder="Card number"]'
    const EXPIRY_SEL =
      '[autocomplete="cc-exp"], input[placeholder="MM / YY"], input[placeholder="MM/YY"]'
    const CVC_SEL =
      '[autocomplete="cc-csc"], input[placeholder="CVC"], input[placeholder="CVV"]'

    // Poll page.frames() (full tree) until the card number input appears
    let cardFrameRef: Frame | undefined
    const scanDeadline = Date.now() + 25_000
    while (Date.now() < scanDeadline && !cardFrameRef) {
      for (const frame of page.frames()) {
        try {
          if ((await frame.locator(CARD_SEL).count()) > 0) {
            cardFrameRef = frame
            console.log(`[e2e] Card input in frame "${frame.name()}"`)
            break
          }
        } catch {
          // Frame detached during traversal — skip
        }
      }
      if (!cardFrameRef) await page.waitForTimeout(500)
    }

    if (!cardFrameRef) {
      // Dump all frame inputs so we can see what Stripe actually rendered
      console.error(
        "[e2e] All frames at timeout:",
        JSON.stringify(
          page.frames().map((f) => ({
            name: f.name().substring(0, 50),
            url: f.url().substring(0, 70),
          }))
        )
      )
      for (const frame of page.frames()) {
        try {
          const inputs = await frame.$$eval("input", (els) =>
            (els as HTMLInputElement[]).map((el) => ({
              n: el.name,
              ph: el.placeholder,
              ac: el.autocomplete,
              al: el.getAttribute("aria-label"),
            }))
          )
          if (inputs.length > 0) {
            console.error(
              `[e2e] "${frame.name()}" inputs:`,
              JSON.stringify(inputs)
            )
          }
        } catch {
          // ignore detached frames
        }
      }
      throw new Error(
        "[e2e] Card number not found in any frame after 25s — check logs above"
      )
    }

    // Fill card number, expiry, and CVC
    // All three may be in the same frame (unified) or separate frames (split-field).
    await cardFrameRef.locator(CARD_SEL).first().fill("4242424242424242")

    // Try expiry in the same frame first; fall back to scanning other frames
    let expiryFilled = (await cardFrameRef.locator(EXPIRY_SEL).count()) > 0
    if (expiryFilled) {
      await cardFrameRef.locator(EXPIRY_SEL).first().fill("12/34")
    } else {
      for (const frame of page.frames()) {
        try {
          if ((await frame.locator(EXPIRY_SEL).count()) > 0) {
            await frame.locator(EXPIRY_SEL).first().fill("12/34")
            expiryFilled = true
            break
          }
        } catch {
          /* skip */
        }
      }
    }

    let cvcFilled = (await cardFrameRef.locator(CVC_SEL).count()) > 0
    if (cvcFilled) {
      await cardFrameRef.locator(CVC_SEL).first().fill("123")
    } else {
      for (const frame of page.frames()) {
        try {
          if ((await frame.locator(CVC_SEL).count()) > 0) {
            await frame.locator(CVC_SEL).first().fill("123")
            cvcFilled = true
            break
          }
        } catch {
          /* skip */
        }
      }
    }

    // Postal code — optional
    const postalInput = cardFrameRef.locator('input[placeholder="ZIP"]').first()
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
