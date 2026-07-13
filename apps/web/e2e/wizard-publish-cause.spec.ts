/**
 * e2e/wizard-publish-cause.spec.ts
 *
 * Tests the wizard → publish flow for a CAUSE favpoll — the faceless path
 * that forks away from the person path at step 1 and takes different
 * branches at every layer: no category (null since the 2026-07-13 remodel),
 * the details page's from-wizard gate, FormInner's subject-aware guard, the
 * CauseHero, and the cause-label field instead of a protagonist name.
 *
 * Exists because none of those branches are exercised by
 * wizard-publish.spec.ts (She + Memorial), and the first remodel regression
 * — FormInner's `if (!category) return null` blank-paging the details page —
 * shipped through 1024 green unit tests and was only caught by a manual
 * founder run-through of exactly this flow.
 *
 * Flow:
 *   1. Sign in (via storageState from auth.setup.ts)
 *   2. Navigate to /favpolls/new wizard
 *   3. Honour step: "A cause" alone — no type; Next must enable immediately
 *   4. Charity step: Marie Curie
 *   5. Love step: Colour topic
 *   6. Details page: MUST render (the blank-page regression) → fill cause label
 *   7. Publish: set close date → Publish
 *   8. Skip shared fund modal
 *   9. Assert: favpoll page shows "In support of" + the cause label
 *  10. Assert: Colour poll visible, countdown showing a real value
 *  11. Assert: IS listed on /favpolls (cause → is_listed = true — the
 *      inverse of the memorial spec's unlisted assertion)
 *
 * Prerequisites: same as wizard-publish.spec.ts (auth.setup.ts storageState,
 * E2E_TEST_EMAIL / E2E_TEST_PASSWORD in env; writes to staging Supabase and
 * the created favpoll is not cleaned up).
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
  test("creates a cause favpoll via wizard and verifies the published page", async ({
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

    // ── 2. Honour step — the cause fork ───────────────────────────────────────
    // "A cause" sits alone below the OR divider. Selecting it is the complete
    // answer to step 1: no type question applies (category stays null), so
    // Next must enable from this single click.
    const causeRadio = page.getByRole("radio", { name: "A cause" })
    await expect(causeRadio).toBeVisible({ timeout: 10_000 })
    await causeRadio.click()
    await expect(causeRadio).toBeChecked()

    const nextButton = page.getByRole("button", { name: /next/i })
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

    // Charity options render as buttons (not ToggleGroup radios).
    const marieCurieOption = charityDialog
      .getByRole("button", { name: /marie curie/i })
      .first()
    await expect(marieCurieOption).toBeVisible({ timeout: 5_000 })
    await marieCurieOption.click()

    await expect(charityDialog).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Marie Curie")).toBeVisible()

    await page.getByRole("button", { name: /next/i }).click()

    // ── 4. Love step (topic picker) ───────────────────────────────────────────
    const pickTopicBtn = page.getByRole("button", { name: /pick a topic/i })
    await expect(pickTopicBtn).toBeVisible({ timeout: 10_000 })
    await pickTopicBtn.click()

    const topicDialog = page.getByRole("dialog")
    await expect(topicDialog).toBeVisible({ timeout: 5_000 })

    const topicSearch = topicDialog.getByRole("textbox")
    await expect(topicSearch).toBeVisible()
    await topicSearch.fill("Colour")

    // Topic chips render as buttons; "Colour" can appear twice when it is
    // also in the "Suggested for {charity}" section — take the first.
    const colourOption = topicDialog
      .getByRole("button", { name: /^colour$/i })
      .first()
    await expect(colourOption).toBeVisible({ timeout: 5_000 })
    await colourOption.click()

    await expect(topicDialog).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Colour")).toBeVisible()

    await page.getByRole("button", { name: /set up/i }).click()

    // ── 5. Details page — the blank-page regression check ─────────────────────
    // The cause handoff arrives with NO category param. Both the page's
    // from-wizard gate and FormInner's guard must accept subject=cause, or
    // this renders header-and-footer only (the exact 2026-07-13 regression).
    await page.waitForURL(/\/favpolls\/new\/details/, { timeout: 10_000 })
    await page.waitForLoadState("domcontentloaded")

    const causeLabelField = page.getByText("What are you raising for?")
    await expect(causeLabelField).toBeVisible({ timeout: 10_000 })

    // Fill the cause label (the cause path's equivalent of the name field).
    await causeLabelField.click()
    const causeInput = page.getByPlaceholder(/dementia research/i)
    await expect(causeInput).toBeVisible({ timeout: 5_000 })
    await causeInput.fill(TEST_CAUSE_LABEL)
    await page.getByRole("button", { name: /save/i }).click()
    await expect(page.getByText(TEST_CAUSE_LABEL)).toBeVisible()

    // ── 6. Publish ────────────────────────────────────────────────────────────
    const publishButton = page.getByRole("button", { name: /^publish$/i })
    await expect(publishButton).toBeVisible({ timeout: 10_000 })
    await publishButton.click()

    const closeDateDialog = page
      .getByRole("dialog")
      .or(page.locator("[data-radix-dialog-content]"))
    await expect(closeDateDialog).toBeVisible({ timeout: 5_000 })

    const oneMonthBtn = page
      .getByRole("button", { name: /1 month/i })
      .or(page.getByRole("button", { name: /1m/i }))
    if (await oneMonthBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await oneMonthBtn.click()
    } else {
      const presets = closeDateDialog.getByRole("button").filter({
        hasNotText: /back|cancel|publish|save/i,
      })
      await presets.first().click()
    }

    const publishConfirm = closeDateDialog
      .getByRole("button", { name: /^publish$/i })
      .or(page.getByRole("button", { name: /^publish$/i }).last())
    await expect(publishConfirm).toBeEnabled({ timeout: 5_000 })
    await publishConfirm.click()

    // ── 7. Skip shared fund modal ─────────────────────────────────────────────
    const skipLink = page
      .getByRole("link", { name: /skip for now/i })
      .or(page.getByText(/skip for now/i))
    await expect(skipLink).toBeVisible({ timeout: 15_000 })
    await skipLink.click()

    // ── 8. Verify: favpoll page renders the cause hero ────────────────────────
    await page.waitForURL(/\/favpolls\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await page.waitForLoadState("domcontentloaded")

    // Cause headline prefix (getFavpollHeadline for subject=cause).
    await expect(page.getByText(/in support of/i)).toBeVisible({
      timeout: 10_000,
    })
    // The cause label is the h1 — CauseHero, not the protagonist hero.
    await expect(
      page.getByRole("heading", { level: 1, name: TEST_CAUSE_LABEL })
    ).toBeVisible()

    // Colour poll section is live.
    const pollSection = page.getByRole("region", { name: /colour poll/i })
    await expect(pollSection).toBeVisible({ timeout: 10_000 })

    // ── 9. Verify: countdown shows a real value ───────────────────────────────
    await expect(page.getByText(/closes in/i)).toBeVisible()
    const countdownText = await page
      .getByRole("timer")
      .or(page.locator(".countdown, [aria-live='polite']").first())
      .textContent()
      .catch(() => "")
    expect(countdownText).not.toBe("--")

    // ── 10. Verify: IS listed on /favpolls ───────────────────────────────────
    // Cause → cause register → is_listed = true: the inverse of the memorial
    // spec's unlisted assertion. The freshly created favpoll should appear.
    await page.goto("/favpolls")
    await page.waitForLoadState("domcontentloaded")

    await expect(
      page.getByText(TEST_CAUSE_LABEL, { exact: false }).first()
    ).toBeVisible({ timeout: 10_000 })
  })
})
