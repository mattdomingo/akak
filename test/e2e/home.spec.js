const { test, expect } = require('@playwright/test');

test('landing page presents Acacia Wisconsin and recruitment route', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Acacia Wisconsin/);
  await expect(page.getByRole('heading', { name: /Find your people/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore Recruitment/i })).toHaveAttribute('href', '#rush');
});

test('mobile navigation opens and closes when a link is selected', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /Toggle navigation/i });
  const navigation = page.getByRole('navigation', { name: /Main navigation/i });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toHaveClass(/open/);

  await navigation.getByRole('link', { name: 'Our Chapter' }).click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).not.toHaveClass(/open/);
});
