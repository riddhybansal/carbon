/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { expect, test } from '@playwright/test';
import { visitStory } from '../../test-utils/storybook';

test.describe('@avt Toggletip', () => {
  test('@avt-default-state Toggletip', async ({ page }) => {
    await visitStory(page, {
      component: 'Toggletip',
      id: 'components-toggletip--default',
      globals: {
        theme: 'white',
      },
    });
    await expect(page).toHaveNoACViolations('Toggletip');
  });

  test('@avt-keyboard-nav Toggletip', async ({ page }) => {
    await visitStory(page, {
      component: 'Toggletip',
      id: 'components-toggletip--default',
      globals: {
        theme: 'white',
      },
    });

    // Checking first Toggletip interaction
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Show information').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.cds--popover--open')).toBeVisible();
    // Tabbing inside the popover
    await page.keyboard.press('Tab');
    await expect(page.locator('.cds--link').first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Button' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.cds--popover--open')).toBeHidden();
  });
});
