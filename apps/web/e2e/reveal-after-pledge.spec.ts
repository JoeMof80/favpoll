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
    // Colour is a finite topic — favourites render as radio chips inside the dialog
    const chips = dialog.getByRole("radio")
    const firstChip = chips.first()
    await expect(firstChip).toBeVisible({ timeout: 10_000 })
    await firstChip.click()
    await expect(firstChip).toBeChecked()

    // Advance to step 2
    await dialog.getByRole("button", { name: /next/i }).click()

    // ── 5. Step 2: Set pledge amount ──────────────────────────────────────────
    // StepAmount renders amount presets as radio buttons.
    // Pick the first preset (smallest available amount).
    await expect(dialog).toContainText(/your pledge/i, { timeout: 10_000 })
    const amountPresets = dialog.getByRole("radio")
    const firstPreset = amountPresets.first()
    await expect(firstPreset).toBeVisible()
    await firstPreset.click()
    await expect(firstPreset).toBeChecked()

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

    // Stripe PaymentElement renders inside an iframe.
    // In test mode, the card payment form is the default payment method.
    // Selector covers both Stripe Elements v2 and v3 iframe naming.
    const stripeFrame = page
      .frameLocator('iframe[title="Secure payment input frame"]')
      .first()

    const cardNumberInput = stripeFrame
      .getByPlaceholder("1234 1234 1234 1234")
      .or(stripeFrame.getByLabel(/card number/i))
    await expect(cardNumberInput).toBeVisible({ timeout: 20_000 })
    await cardNumberInput.fill("4242424242424242")

    await stripeFrame
      .getByPlaceholder("MM / YY")
      .or(stripeFrame.getByLabel(/expir/i))
      .fill("12/34")

    await stripeFrame
      .getByPlaceholder("CVC")
      .or(stripeFrame.getByLabel(/cvc|security code/i))
      .fill("123")

    // Postal code — present in some Stripe configurations
    const postalInput = stripeFrame
      .getByPlaceholder("ZIP")
      .or(stripeFrame.getByLabel(/postal/i))
    if (await postalInput.count().then((n) => n > 0)) {
      const visible = await postalInput
        .first()
        .isVisible()
        .catch(() => false)
      if (visible) await postalInput.first().fill("10001")
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
