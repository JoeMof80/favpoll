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
    // Stripe renders card inputs inside an "elements-inner-easel" iframe
    // (identified by URL). A Link/wallet-check iframe (also titled "Secure
    // payment input frame") may appear first and then vanish — ignore it.
    // Attribute selectors (autocomplete, aria-label, placeholder) are
    // Stripe-version-dependent; fill by DOM position instead.

    // Wait for the first Secure iframe to signal Elements has mounted
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

    // Screenshot confirmed the card form IS rendered with standard inputs
    // (placeholders "1234 1234 1234 1234", "MM / YY", "CVC"). They are NOT
    // in the elements-inner-easel frame (that is the outer PaymentElement
    // shell); they live in another Stripe frame — likely elements-inner-
    // accessory-target. Scan every stripe.com frame for any <input>.
    let cardFrame: Frame | undefined
    const cardDeadline = Date.now() + 25_000
    while (Date.now() < cardDeadline && !cardFrame) {
      for (const frame of page.frames()) {
        if (
          !frame.url().includes("stripe.com") &&
          !frame.url().includes("stripe.network")
        )
          continue
        try {
          const n = await frame.locator("input").count()
          if (n > 0) {
            cardFrame = frame
            console.log(
              `[e2e] Card inputs (${n}) found in: ${frame.url().substring(0, 80)}`
            )
            break
          }
        } catch {
          /* frame detached during traversal */
        }
      }
      if (!cardFrame) await page.waitForTimeout(500)
    }

    if (!cardFrame) {
      console.error(
        "[e2e] All frames at deadline:",
        JSON.stringify(
          page.frames().map((f) => ({
            name: f.name().substring(0, 40),
            url: f.url().substring(0, 80),
          }))
        )
      )
      throw new Error(
        "[e2e] No card inputs found in any Stripe frame after 25s"
      )
    }

    // Target card fields by placeholder to avoid positional ambiguity.
    // The PaymentElement can render a Link email field above card inputs,
    // which shifts nth() positions and causes fill of wrong fields.
    // pressSequentially fires real key events so Stripe's formatters work.
    const cardNumberInput = cardFrame.locator(
      'input[placeholder="1234 1234 1234 1234"]'
    )
    const expiryInput = cardFrame.locator('input[placeholder="MM / YY"]')
    const cvcInput = cardFrame.locator('input[placeholder="CVC"]')

    // Log all visible input placeholders for debugging
    const allInputs = cardFrame.locator("input").filter({ visible: true })
    const visCount = await allInputs.count()
    const placeholders: string[] = []
    for (let i = 0; i < visCount; i++) {
      placeholders.push(
        (await allInputs.nth(i).getAttribute("placeholder")) ?? "(none)"
      )
    }
    console.log(
      `[e2e] Visible inputs (${visCount}):`,
      JSON.stringify(placeholders)
    )

    await expect(cardNumberInput).toBeVisible({ timeout: 10_000 })
    await cardNumberInput.click()
    await cardNumberInput.pressSequentially("4242424242424242")

    await expiryInput.click()
    await expiryInput.pressSequentially("1234")

    await cvcInput.click()
    await cvcInput.pressSequentially("123")

    // ZIP is required when Stripe geolocates the runner as US.
    // Stripe's billing ZIP input uses placeholder "12345" (a sample ZIP).
    const zipInput = cardFrame.locator(
      'input[placeholder="12345"], input[placeholder*="ZIP"], input[placeholder*="Postal"]'
    )
    if ((await zipInput.count()) > 0) {
      await zipInput.first().click()
      await zipInput.first().pressSequentially("10001")
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
    const revealBlock = page.locator('blockquote[role="status"]')
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
