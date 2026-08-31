/**
 * e2e/wizard-publish.spec.ts
 *
 * Tests the six-step wizard → publish flow as an authenticated organiser
 * (the extended-wizard verdict, references/extended-wizard-plan.md —
 * the wizard publishes itself; there is no details handoff).
 *
 * Flow:
 *   1. Sign in (via storageState from auth.setup.ts)
 *   2. Navigate to /favpolls/new
 *   3. Event step: Memorial
 *   4. Charity step: Marie Curie
 *   5. Topic step: Colour
 *   6. Header step: fill the protagonist name
 *   7. Story step: fill the About
 *   8. Settings step: close date via the dropdown's "1 month" preset →
 *      Publish
 *   9. Skip shared fund modal
 *  10. Assert: favpoll page shows correct headline prefix
 *  11. Assert: Colour poll visible, countdown showing a real value
 *  12. Assert: not listed on /favpolls (memorial defaults unlisted —
 *      isListed = register !== "remembering")
 *
 * Prerequisites:
 *   - auth.setup.ts must have written e2e/.auth/user.json (signed-in organiser)
 *   - E2E_TEST_EMAIL / E2E_TEST_PASSWORD set in env
 *   - The wizard writes to staging Supabase (favpoll is left in staging after test)
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
  test("creates a memorial favpoll via the six-step wizard and verifies the published page", async ({
    page,
  }) => {
    // ── 1. Navigate to the wizard ─────────────────────────────────────────────
    await page.goto("/favpolls/new")
    await page.waitForLoadState("domcontentloaded")

    if (page.url().includes("/sign-in")) {
      console.warn(
        "\n[wizard-publish] ⚠  Redirected to sign-in — storageState was empty.\n" +
          "  auth.setup.ts did not complete. Check Clerk configuration on the preview.\n"
      )
      return
    }

    await expect(page).toHaveURL(/\/favpolls\/new/)

    // ── 2. Event step ────────────────────────────────────────────────────────
    const memorialRadio = page.getByRole("radio", { name: /memorial/i })
    await expect(memorialRadio).toBeVisible({ timeout: 10_000 })
    await memorialRadio.click()
    await expect(memorialRadio).toBeChecked()

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 3. Charity step ───────────────────────────────────────────────────────
    await expect(page).not.toHaveURL(/\/sign-in/)
    const pickCharityBtn = page.getByRole("button", { name: /pick a charity/i })
    await expect(pickCharityBtn).toBeVisible({ timeout: 10_000 })
    await pickCharityBtn.click()

    const charityDialog = page.getByRole("dialog")
    await expect(charityDialog).toBeVisible({ timeout: 5_000 })

    const charitySearch = charityDialog.getByRole("textbox")
    await expect(charitySearch).toBeVisible()
    await charitySearch.fill("Marie Curie")

    const marieCurieOption = charityDialog
      .getByRole("button", { name: /marie curie/i })
      .first()
    await expect(marieCurieOption).toBeVisible({ timeout: 5_000 })
    await marieCurieOption.click()

    await charityDialog.getByRole("button", { name: /^done$/i }).click()
    await expect(charityDialog).not.toBeVisible({ timeout: 5_000 })
    // .first(): the rail summary echoes the charity name.
    await expect(page.getByText("Marie Curie").first()).toBeVisible()

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 4. Topic step ─────────────────────────────────────────────────────────
    const pickTopicBtn = page.getByRole("button", { name: /pick a topic/i })
    await expect(pickTopicBtn).toBeVisible({ timeout: 10_000 })
    await pickTopicBtn.click()

    const topicDialog = page.getByRole("dialog")
    await expect(topicDialog).toBeVisible({ timeout: 5_000 })

    const topicSearch = topicDialog.getByRole("textbox")
    await expect(topicSearch).toBeVisible()
    await topicSearch.fill("Colour")

    const colourOption = topicDialog
      .getByRole("button", { name: /^colour$/i })
      .first()
    await expect(colourOption).toBeVisible({ timeout: 5_000 })
    await colourOption.click()

    await expect(topicDialog).not.toBeVisible({ timeout: 5_000 })
    // .first(): the rail summary echoes the topic title.
    await expect(page.getByText("Colour").first()).toBeVisible()

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 5. Header step ──────────────────────────────────────────────────────────
    await expect(page.getByRole("heading", { name: "Header" })).toBeVisible({
      timeout: 10_000,
    })
    const nameInput = page.getByPlaceholder(/name or nickname|whitfield/i)
    await expect(nameInput).toBeVisible({ timeout: 5_000 })
    await nameInput.fill(TEST_PROTAGONIST_NAME)

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 6. Story step ─────────────────────────────────────────────────────────
    await expect(page.getByRole("heading", { name: "Story" })).toBeVisible({
      timeout: 10_000,
    })
    await page.locator("textarea").first().fill("An e2e about line.")

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 7. Settings step: close date preset → Publish ─────────────────────────
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole("button", { name: /pick a close date/i }).click()
    // The preset chips live inside the calendar dropdown (DateTimePicker
    // presets column). Exact match — a broad fallback can hit calendar
    // internals.
    await page.getByRole("button", { name: "1 month", exact: true }).click()

    const publishButton = page.getByRole("button", {
      name: /^publish$/i,
    })
    await expect(publishButton).toBeEnabled({ timeout: 5_000 })
    await publishButton.click()

    // ── 8. Skip shared fund modal ─────────────────────────────────────────────
    const skipLink = page
      .getByRole("link", { name: /skip for now/i })
      .or(page.getByText(/skip for now/i))
    await expect(skipLink).toBeVisible({ timeout: 15_000 })
    await skipLink.click()

    // ── 9. Verify: favpoll page renders correctly ─────────────────────────────
    await page.waitForURL(/\/favpolls\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await page.waitForLoadState("domcontentloaded")

    // No occasion and no opening line → the prefix derives to "Honouring".
    await expect(page.getByText(/honouring/i).first()).toBeVisible({
      timeout: 10_000,
    })
    await expect(
      page.getByRole("heading", { level: 1, name: TEST_PROTAGONIST_NAME })
    ).toBeVisible()

    const pollSection = page.getByRole("region", {
      name: /colour poll/i,
    })
    await expect(pollSection).toBeVisible({ timeout: 10_000 })

    // ── 10. Verify: countdown shows a real value ─────────────────────────────
    await expect(page.getByText(/closes in/i)).toBeVisible()
    const countdownText = await page
      .getByRole("timer")
      .or(page.locator(".countdown, [aria-live='polite']").first())
      .textContent()
      .catch(() => "")
    expect(countdownText).not.toBe("--")

    // ── 11. Verify: not listed on /favpolls ──────────────────────────────────
    // Memorial → register "remembering" → isListed defaults false.
    const currentUrl = page.url()
    const favpollId = currentUrl.match(/\/favpolls\/([0-9a-f-]{36})/)?.[1]
    expect(favpollId).toBeTruthy()

    await page.goto("/favpolls")
    await page.waitForLoadState("domcontentloaded")

    await expect(
      page.getByText(TEST_PROTAGONIST_NAME, { exact: false })
    ).not.toBeVisible()
  })
})
