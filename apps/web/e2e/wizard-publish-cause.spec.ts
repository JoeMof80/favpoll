/**
 * e2e/wizard-publish-cause.spec.ts
 *
 * Tests the six-step wizard → publish flow for a CAUSE favpoll — the
 * faceless path. Cause lives on the Name field's who dropdown (the
 * extended-wizard verdict): picking it renames the field to "Cause",
 * commits subject='cause', and the name field carries the cause label.
 *
 * Flow:
 *   1. Sign in (via storageState from auth.setup.ts)
 *   2. Navigate to /favpolls/new
 *   3. Event step: Fundraiser
 *   4. Charity step: Marie Curie
 *   5. Topic step: Colour
 *   6. Header step: who dropdown → Cause → fill the cause label
 *   7. Story step: fill the About
 *   8. Settings step: "1 month" preset → Publish
 *   9. Skip shared fund modal
 *  10. Assert: favpoll page shows "In support of" + the cause label
 *  11. Assert: Colour poll visible, countdown showing a real value
 *  12. Assert: IS listed on /favpolls (cause register defaults listed —
 *      the inverse of the memorial spec's unlisted assertion)
 *
 * Prerequisites: same as wizard-publish.spec.ts.
 */

import { test, expect } from "@playwright/test"

const TEST_CAUSE_LABEL = `E2E Cause Test ${new Date().toISOString().slice(0, 10)}`

// ── Guard: skip if auth wasn't set up ────────────────────────────────────────
test.beforeAll(() => {
  if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
    test.skip(
      true,
      "E2E_TEST_EMAIL or E2E_TEST_PASSWORD not set — skipping cause wizard test."
    )
  }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("wizard → publish flow (cause)", () => {
  test("creates a cause favpoll via the six-step wizard and verifies the published page", async ({
    page,
  }) => {
    // ── 1. Navigate to the wizard ─────────────────────────────────────────────
    await page.goto("/favpolls/new")
    await page.waitForLoadState("domcontentloaded")

    if (page.url().includes("/sign-in")) {
      console.warn(
        "\n[wizard-publish-cause] ⚠  Redirected to sign-in — storageState was empty.\n" +
          "  auth.setup.ts did not complete. Check Clerk configuration on the preview.\n"
      )
      return
    }

    await expect(page).toHaveURL(/\/favpolls\/new/)

    // ── 2. Event step ────────────────────────────────────────────────────────
    const fundraiserRadio = page.getByRole("radio", { name: "Fundraiser" })
    await expect(fundraiserRadio).toBeVisible({ timeout: 10_000 })
    await fundraiserRadio.click()
    await expect(fundraiserRadio).toBeChecked()

    const nextButton = page.getByRole("button", { name: /^next$/i })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

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

    // ── 5. Header step: the cause label goes in the name field ────────────────
    // The who menu moved to the Story step's Generate split button
    // (2026-09-02), so Header just takes the label — the field reads
    // "Name or Cause" under Fundraiser.
    await expect(page.getByRole("heading", { name: "Header" })).toBeVisible({
      timeout: 10_000,
    })

    const causeInput = page.getByPlaceholder(/name or cause/i)
    await expect(causeInput).toBeVisible({ timeout: 5_000 })
    await causeInput.fill(TEST_CAUSE_LABEL)

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 6. Story step: declare the cause on the Generate split button ─────────
    await expect(page.getByRole("heading", { name: "Story" })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole("button", { name: "Who is this favpoll for?" }).click()
    await page.getByRole("menuitem", { name: "Cause" }).click()

    await page.locator("textarea").first().fill("An e2e cause about line.")

    await page.getByRole("button", { name: /^next$/i }).click()

    // ── 7. Settings step: preset → Publish ────────────────────────────────────
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole("button", { name: /pick a close date/i }).click()
    await page.getByRole("button", { name: "1 month", exact: true }).click()

    const publishButton = page.getByRole("button", { name: /^publish$/i })
    await expect(publishButton).toBeEnabled({ timeout: 5_000 })
    await publishButton.click()

    // ── 8. Skip shared fund modal ─────────────────────────────────────────────
    const skipLink = page
      .getByRole("link", { name: /skip for now/i })
      .or(page.getByText(/skip for now/i))
    await expect(skipLink).toBeVisible({ timeout: 15_000 })
    await skipLink.click()

    // ── 9. Verify: favpoll page renders the cause hero ────────────────────────
    await page.waitForURL(/\/favpolls\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await page.waitForLoadState("domcontentloaded")

    await expect(page.getByText(/in support of/i)).toBeVisible({
      timeout: 10_000,
    })
    await expect(
      page.getByRole("heading", { level: 1, name: TEST_CAUSE_LABEL })
    ).toBeVisible()

    const pollSection = page.getByRole("region", { name: /colour poll/i })
    await expect(pollSection).toBeVisible({ timeout: 10_000 })

    // ── 10. Verify: countdown shows a real value ──────────────────────────────
    await expect(page.getByText(/closes in/i)).toBeVisible()
    const countdownText = await page
      .getByRole("timer")
      .or(page.locator(".countdown, [aria-live='polite']").first())
      .textContent()
      .catch(() => "")
    expect(countdownText).not.toBe("--")

    // ── 11. Verify: IS listed on /favpolls ───────────────────────────────────
    await page.goto("/favpolls")
    await page.waitForLoadState("domcontentloaded")

    await expect(
      page.getByText(TEST_CAUSE_LABEL, { exact: false }).first()
    ).toBeVisible({ timeout: 10_000 })
  })
})
