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

    // Find the elements-inner-easel frame by URL (the actual card form)
    let easelFrame: Frame | undefined
    const easelDeadline = Date.now() + 20_000
    while (Date.now() < easelDeadline && !easelFrame) {
      easelFrame = page
        .frames()
        .find((f) => f.url().includes("elements-inner-easel"))
      if (!easelFrame) await page.waitForTimeout(500)
    }

    if (!easelFrame) {
      console.error(
        "[e2e] elements-inner-easel frame not found. All frames:",
        JSON.stringify(
          page.frames().map((f) => ({
            name: f.name().substring(0, 50),
            url: f.url().substring(0, 80),
          }))
        )
      )
      throw new Error("[e2e] Stripe elements-inner-easel frame not found")
    }

    console.log(`[e2e] Easel frame: ${easelFrame.url().substring(0, 80)}`)

    // Dump easel HTML immediately — always runs before the poll so we get
    // diagnostic data even when the poll exhausts.
    try {
      const easelHTML = await easelFrame.content()
      console.log("[e2e] Easel HTML:", easelHTML.substring(0, 3000))
    } catch {
      // frame.content() may fail for cross-origin frames — fall back to evaluate
      try {
        const dump = await easelFrame.evaluate(() => ({
          readyState: document.readyState,
          inputs: document.querySelectorAll("input").length,
          ce: document.querySelectorAll("[contenteditable=true]").length,
          elems: document.querySelectorAll("*").length,
          body: document.body?.innerHTML?.substring(0, 1500) ?? "no body",
        }))
        console.log("[e2e] Easel dump:", JSON.stringify(dump))
      } catch (e2) {
        console.error(
          "[e2e] Cannot inspect easel:",
          String(e2).substring(0, 200)
        )
      }
    }

    // Poll for card fields. Stripe's PaymentElement may render either
    // <input> elements or [contenteditable=true] divs depending on version.
    // Log errors from count() so silent catch-0 doesn't hide frame issues.
    type FieldType = "input" | "contenteditable" | "none"
    let fieldType: FieldType = "none"
    let fieldCount = 0
    const fieldDeadline = Date.now() + 25_000
    while (Date.now() < fieldDeadline && fieldType === "none") {
      const iCount = await easelFrame
        .locator("input")
        .count()
        .catch((e: Error) => {
          console.error(
            "[e2e] input count error:",
            e.message?.substring(0, 100)
          )
          return 0
        })
      if (iCount > 0) {
        fieldType = "input"
        fieldCount = iCount
        break
      }
      const ceCount = await easelFrame
        .locator("[contenteditable=true]")
        .count()
        .catch(() => 0)
      if (ceCount > 0) {
        fieldType = "contenteditable"
        fieldCount = ceCount
        break
      }
      await page.waitForTimeout(500)
    }

    console.log(`[e2e] Easel field type: ${fieldType}, count: ${fieldCount}`)

    if (fieldType === "input") {
      const inputInfo = await easelFrame
        .$$eval("input", (els) =>
          (els as HTMLInputElement[]).map((el) => ({
            n: el.name,
            ph: el.placeholder,
            ac: el.autocomplete,
            al: el.getAttribute("aria-label"),
            t: el.type,
          }))
        )
        .catch(() => [])
      console.log("[e2e] Easel inputs:", JSON.stringify(inputInfo))
    }

    if (fieldType === "none") {
      throw new Error("[e2e] No card fields in Stripe easel frame after 25s")
    }

    const fieldSel = fieldType === "input" ? "input" : "[contenteditable=true]"

    // Fill by DOM position: card number → expiry → CVC (Stripe's standard order)
    await easelFrame.locator(fieldSel).nth(0).fill("4242424242424242")
    if (fieldCount >= 2) await easelFrame.locator(fieldSel).nth(1).fill("12/34")
    if (fieldCount >= 3) await easelFrame.locator(fieldSel).nth(2).fill("123")
    if (fieldCount >= 4) await easelFrame.locator(fieldSel).nth(3).fill("10001")

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
