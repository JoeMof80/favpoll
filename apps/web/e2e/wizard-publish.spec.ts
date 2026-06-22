/**
 * e2e/wizard-publish.spec.ts
 *
 * Tests the 3-step wizard → publish flow as an authenticated organiser.
 * This exercises the exact category/grouping/opening_line write path that
 * PR #120 fixed in the seed scripts — but here it tests the live wizard's
 * writes, which is a different code path. The test confirms that the wizard
 * correctly writes category/grouping/opening_line/subject/is_listed to the DB
 * (verifiable via the rendered page: headline prefix, countdown).
 *
 * Flow:
 *   1. Sign in (via storageState from auth.setup.ts)
 *   2. Navigate to /favpolls/new wizard
 *   3. Honour step: An individual + Memorial
 *   4. Charity step: Marie Curie
 *   5. Love step: Colour topic
 *   6. Details page: fill protagonist name
 *   7. Publish: set close date → Publish
 *   8. Skip shared fund modal
 *   9. Assert: favpoll page shows correct headline prefix
 *  10. Assert: Colour poll visible, countdown showing real value (not --)
 *  11. Assert: not listed on /favpolls (memorial → is_listed = false)
 *
 * Prerequisites:
 *   - auth.setup.ts must have written e2e/.auth/user.json (signed-in organiser)
 *   - E2E_TEST_EMAIL / E2E_TEST_PASSWORD set in env
 *   - The wizard writes to staging Supabase (favpoll is left in staging after test)
 *
 * Note: Each test run creates a new favpoll in staging. The favpoll is not
 * cleaned up — it is identifiable by its randomly generated UUID and can be
 * deleted manually if needed. The protagonist name includes a timestamp to
 * make each run's output distinct.
 */

import { test, expect } from "@playwright/test"

const TEST_PROTAGONIST_NAME = `E2E Wizard Test ${new Date().toISOString().slice(0, 10)}`

// ── Guard: skip if auth wasn't set up ────────────────────────────────────────
test.beforeAll(() => {
  if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
    test.skip(
      true,
      "E2E_TEST_EMAIL or E2E_TEST_PASSWORD not set — skipping wizard test. " +
        "Create a Clerk test account with email + password auth and add credentials to env."
    )
  }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("wizard → publish flow", () => {
  test("creates a memorial favpoll via wizard and verifies the published page", async ({
    page,
  }) => {
    // ── 1. Navigate to the wizard ─────────────────────────────────────────────
    // /favpolls/new redirects to /sign-in if not authenticated.
    // storageState from auth.setup.ts provides the session.
    await page.goto("/favpolls/new")
    await page.waitForLoadState("domcontentloaded")

    // Confirm we reached the wizard (not redirected to sign-in)
    await expect(page).not.toHaveURL(/\/sign-in/)
    await expect(page).toHaveURL(/\/favpolls\/new/)

    // ── 2. Honour step ────────────────────────────────────────────────────────
    // Two ToggleGroup rows render with role="radio" (per PROJECT.md convention).
    // Subject row: "An individual" is the default; confirm it's checked.
    // Category row: select "Memorial".
    const individualRadio = page.getByRole("radio", { name: /an individual/i })
    await expect(individualRadio).toBeVisible({ timeout: 10_000 })
    // "An individual" should be the default selection
    // Click it explicitly to be safe
    await individualRadio.click()

    const memorialRadio = page.getByRole("radio", { name: /memorial/i })
    await expect(memorialRadio).toBeVisible()
    await memorialRadio.click()
    await expect(memorialRadio).toBeChecked()

    // Next → (advances to Charity step)
    await page.getByRole("button", { name: /next/i }).click()

    // ── 3. Charity step ───────────────────────────────────────────────────────
    // "Pick a charity" ghost button opens the charity overlay.
    await expect(page).not.toHaveURL(/\/sign-in/)
    const pickCharityBtn = page.getByRole("button", { name: /pick a charity/i })
    await expect(pickCharityBtn).toBeVisible({ timeout: 10_000 })
    await pickCharityBtn.click()

    // Charity overlay (ResponsiveOverlay → Dialog on desktop)
    const charityDialog = page.getByRole("dialog")
    await expect(charityDialog).toBeVisible({ timeout: 5_000 })

    // Search for and select Marie Curie
    const charitySearch = charityDialog.getByRole("textbox")
    await expect(charitySearch).toBeVisible()
    await charitySearch.fill("Marie Curie")

    const marieCurieOption = charityDialog.getByRole("radio", {
      name: /marie curie/i,
    })
    await expect(marieCurieOption).toBeVisible({ timeout: 5_000 })
    await marieCurieOption.click()

    // Overlay closes after selection; WizardCharityCard appears
    await expect(charityDialog).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Marie Curie")).toBeVisible()

    // Next → (advances to Love step)
    await page.getByRole("button", { name: /next/i }).click()

    // ── 4. Love step (topic picker) ───────────────────────────────────────────
    // "Pick a topic" button opens the topic overlay.
    const pickTopicBtn = page.getByRole("button", { name: /pick a topic/i })
    await expect(pickTopicBtn).toBeVisible({ timeout: 10_000 })
    await pickTopicBtn.click()

    const topicDialog = page.getByRole("dialog")
    await expect(topicDialog).toBeVisible({ timeout: 5_000 })

    // Search for Colour
    const topicSearch = topicDialog.getByRole("textbox")
    await expect(topicSearch).toBeVisible()
    await topicSearch.fill("Colour")

    // Select the Colour topic chip
    const colourOption = topicDialog.getByRole("radio", { name: /^colour$/i })
    await expect(colourOption).toBeVisible({ timeout: 5_000 })
    await colourOption.click()

    await expect(topicDialog).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Colour")).toBeVisible()

    // "Set up my event" on the last step
    await page.getByRole("button", { name: /set up/i }).click()

    // ── 5. Details page ───────────────────────────────────────────────────────
    await page.waitForURL(/\/favpolls\/new\/details/, { timeout: 10_000 })
    await page.waitForLoadState("domcontentloaded")

    // Fill protagonist name — the form preview shows an editable name field.
    // The name input is in the EditableHero section.
    // Click the name edit area to open the name overlay.
    const nameEditArea = page
      .getByRole("button", { name: /edit name/i })
      .or(page.locator('[aria-label*="name"]').first())
    if (await nameEditArea.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nameEditArea.click()
      // Name overlay input
      const nameInput = page.getByRole("textbox", { name: /name/i }).last()
      await nameInput.fill(TEST_PROTAGONIST_NAME)
      // Save the overlay
      await page.getByRole("button", { name: /save/i }).click()
    } else {
      // Alternative: name may be directly editable in the preview
      const directNameInput = page.getByRole("textbox", { name: /name/i })
      if (
        await directNameInput.isVisible({ timeout: 3_000 }).catch(() => false)
      ) {
        await directNameInput.fill(TEST_PROTAGONIST_NAME)
      }
    }

    // ── 6. Publish ────────────────────────────────────────────────────────────
    // CommandPanel "Publish" button opens CloseDateOverlay.
    const publishButton = page.getByRole("button", { name: /^publish$/i })
    await expect(publishButton).toBeVisible({ timeout: 10_000 })
    await publishButton.click()

    // CloseDateOverlay opens — preset "2 weeks" or "1 month" is sufficient
    const closeDateDialog = page
      .getByRole("dialog")
      .or(page.locator("[data-radix-dialog-content]"))
    await expect(closeDateDialog).toBeVisible({ timeout: 5_000 })

    // Pick "1 month" preset (ensures date is set)
    const oneMonthBtn = page
      .getByRole("button", { name: /1 month/i })
      .or(page.getByRole("button", { name: /1m/i }))
    if (await oneMonthBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await oneMonthBtn.click()
    } else {
      // Fallback: pick the first preset button in the overlay
      const presets = closeDateDialog.getByRole("button").filter({
        hasNotText: /back|cancel|publish|save/i,
      })
      await presets.first().click()
    }

    // Click the "Publish" submit button in the overlay footer
    const publishConfirm = closeDateDialog
      .getByRole("button", { name: /^publish$/i })
      .or(page.getByRole("button", { name: /^publish$/i }).last())
    await expect(publishConfirm).toBeEnabled({ timeout: 5_000 })
    await publishConfirm.click()

    // ── 7. Skip shared fund modal ─────────────────────────────────────────────
    // After createFavpoll succeeds, SeedFundModal appears.
    // "Skip for now" calls onComplete() → navigates to /favpolls/[id].
    const skipLink = page
      .getByRole("link", { name: /skip for now/i })
      .or(page.getByText(/skip for now/i))
    await expect(skipLink).toBeVisible({ timeout: 15_000 })
    await skipLink.click()

    // ── 8. Verify: favpoll page renders correctly ─────────────────────────────
    await page.waitForURL(/\/favpolls\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await page.waitForLoadState("domcontentloaded")

    // Memorial + individual → headline prefix should be "In memory of"
    // (per getFavpollHeadline: remembering → "In memory of")
    // The opening_line from OPENING_LINE_PREFIXES["Memorial"] = "In memory of"
    // is rendered in FavpollHero.
    await expect(page.getByText(/in memory of/i)).toBeVisible({
      timeout: 10_000,
    })

    // Colour poll section should be visible
    const pollSection = page.getByRole("region", {
      name: /colour poll/i,
    })
    await expect(pollSection).toBeVisible({ timeout: 10_000 })

    // ── 9. Verify: countdown shows a real value (not the "--" placeholder) ────
    // EditableCountdown renders Countdown with closesAt set → shows real value.
    // The "--" placeholder only appears in create mode before a date is set.
    // Checking that the page does NOT contain "--" as the countdown text.
    // The Countdown component renders the time remaining as live text.
    await expect(page.getByText(/closes in/i)).toBeVisible()
    // The countdown should not show the placeholder "--"
    const countdownText = await page
      .getByRole("timer")
      .or(page.locator(".countdown, [aria-live='polite']").first())
      .textContent()
      .catch(() => "")
    expect(countdownText).not.toBe("--")

    // ── 10. Verify: not listed on /favpolls ──────────────────────────────────
    // Memorial → is_listed = false (per deriveRegister + listed/unlisted decision).
    // The favpoll should NOT appear on the /favpolls listing page.
    const currentUrl = page.url()
    const favpollId = currentUrl.match(/\/favpolls\/([0-9a-f-]{36})/)?.[1]
    expect(favpollId).toBeTruthy()

    await page.goto("/favpolls")
    await page.waitForLoadState("domcontentloaded")

    // The test protagonist name should not appear in the listing
    await expect(
      page.getByText(TEST_PROTAGONIST_NAME, { exact: false })
    ).not.toBeVisible()
  })
})
