import { test, expect } from '@playwright/test';

/**
 * E2E: Happy-path event flow
 *
 * 1. Visit the landing page
 * 2. Navigate directly to an event detail page
 * 3. Submit an RSVP
 * 4. Verify the RSVP appears in the response list
 *
 * Requires a running stack (frontend + backend + DB).
 * Set BASE_URL env var to point to the frontend origin (default: http://localhost:5173).
 * Set EVENT_SLUG env var to a pre-seeded event slug, or the test uses a fallback slug.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const EVENT_SLUG = process.env.TEST_EVENT_SLUG ?? 'e2e-test-event';

test.describe('Event RSVP flow', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    // Just assert the page renders without a crash
    await expect(page).not.toHaveTitle(/error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('submit RSVP on event detail page and verify it appears', async ({ page }) => {
    // Navigate directly to the event detail page
    await page.goto(`${BASE_URL}/e/${EVENT_SLUG}`);

    // Wait for the RSVP form to be visible
    const nameInput = page.getByLabel(/name/i).first();
    await expect(nameInput).toBeVisible({ timeout: 10_000 });

    // Fill out the RSVP form
    const uniqueName = `E2E Tester ${Date.now()}`;
    const uniqueEmail = `e2e-${Date.now()}@test.example`;

    await nameInput.fill(uniqueName);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(uniqueEmail);
    }

    // Select "Yes" status — try button or select
    const yesButton = page.getByRole('button', { name: /yes/i }).first();
    if (await yesButton.isVisible()) {
      await yesButton.click();
    } else {
      const statusSelect = page.getByLabel(/status/i).first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('yes');
      }
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /rsvp|submit|confirm/i }).first();
    await submitButton.click();

    // Wait for confirmation feedback (toast, text, or updated list)
    await expect(
      page.getByText(new RegExp(uniqueName, 'i')),
    ).toBeVisible({ timeout: 10_000 });
  });
});
