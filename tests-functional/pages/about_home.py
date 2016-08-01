# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page
from selenium.webdriver.common.by import By


class AboutHome(Page):

    _search_field_locator = (By.ID, 'searchText')

    def wait_for_page_to_load(self):
        self.wait.until(lambda s: self.is_element_displayed(
            *self._search_field_locator))
        return self
