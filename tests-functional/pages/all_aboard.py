# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected


class AllAboard(Page):

    _action_button_locator = (
        By.ID,
        'action-button--all-aboard-v12-all-aboard'
    )
    _active_notification_locator = (
        By.CSS_SELECTOR,
        '#action-button--all-aboard-v12-all-aboard[badge="1"]'
    )
    _navbar_locator = (
        By.ID,
        'nav-bar'
    )

    def load_next_sidebar(self):
        """ Waits for notification, clicks the action button """
        notification = self.wait_for_active_notification()
        notification.click()

    def wait_for_action_button_present(self):
        """Ensure that action button is present"""
        self.wait.until(expected.presence_of_element_located(
            self._action_button_locator))

    def wait_for_active_notification(self):
        # wait for the next notification to happen
        return self.wait.until(expected.presence_of_element_located(
                self._active_notification_locator
            )
        )
