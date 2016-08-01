# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page
from selenium.webdriver.common.by import By


class AllAboard(Page):

    _sidebar_locator = (By.CSS_SELECTOR, '#content-deck #sidebar-box')

    @property
    def sidebar(self):
        return self.find_element(*self._sidebar_locator)
