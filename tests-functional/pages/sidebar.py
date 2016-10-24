# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected


class Sidebar(Page):

    _cta_locator = (
        By.CSS_SELECTOR,
        'main button'
    )
    _sidebar_visible_locator = (
        By.CSS_SELECTOR,
        '#content-deck #sidebar-box[sidebarcommand="viewWebPanelsSidebar"]')  # noqa E501
    _sidebar_locator = (
        By.CSS_SELECTOR,
        '#content-deck #sidebar'
    )
    _sidebar_frame_locator = (
        By.CSS_SELECTOR,
        '#webpanels-window #web-panels-browser'
    )

    @property
    def current_step(self):
        self.switch_to_sidebar_frame()
        cta = self.find_element(*self._cta_locator)
        return int(cta.get_attribute('data-step'))

    @property
    def content_container(self):
        return self.selenium.execute_script("""
            var container = document.querySelector('#sidebar').contentDocument
                              .querySelector('#web-panels-browser').contentDocument
                              .querySelector('body > section');
            return container;
        """)

    @property
    def content_container_id(self):
        return self.selenium.execute_script("""
            var container = document.querySelector('#sidebar').contentDocument
                              .querySelector('#web-panels-browser').contentDocument
                              .querySelector('body > section');
            return container.getAttribute('id');
        """)

    @property
    def sidebar(self):
        return self.find_element(*self._sidebar_locator)

    def claim_prize(self):
        return self.selenium.execute_script("""
            var button = document.querySelector('#sidebar').contentDocument
                              .querySelector('#web-panels-browser').contentDocument
                              .querySelector('footer #prize');
            button.click();
        """)

    def click_cta(self):
        # this is executed in the context of the
        # sidebar content frame
        self.find_element(*self._cta_locator).click()

    def ensure_reward_sidebar_loaded(self):
        """ Enures that reward sidebar was loaded """
        self.wait_for_content_container_present()
        return self.content_container_id

    def switch_to_sidebar(self):
        """ switches to the sidebar frame if available """
        # switch to sidebar frame
        self.wait.until(expected.frame_to_be_available_and_switch_to_it(
            self._sidebar_locator
        ))

    def switch_to_sidebar_frame(self):
        """ switches to the web panels browser if available """
        self.switch_to_sidebar()
        self.wait.until(expected.frame_to_be_available_and_switch_to_it(
            self._sidebar_frame_locator
        ))

    def wait_for_content_container_present(self):
        """ Enures reward sidebar content is visible """
        return self.wait.until(expected.visibility_of(self.content_container))

    def wait_for_sidebar_visible(self):
        """ Enures that the sidebar is visible """
        return self.wait.until(
            expected.presence_of_element_located(
                self._sidebar_visible_locator
            )
        )
