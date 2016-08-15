# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait as Wait

from pages.firstrun import Firstrun
from pages.all_aboard import AllAboard


@pytest.mark.nondestructive
@pytest.mark.capabilities(firefox_args=['-foreground'])
def test_first_sidebar_loads(base_url, selenium):
    """ Tests that the sidebar opens after clicking the ActionButton"""
    page = Firstrun(selenium, base_url).open()
    page.complete_firstrun_values_flow()
    # switch to browser chrome
    selenium.set_context('chrome')

    AllAboard(selenium)
    # ensure that add-on action button is added as soon as we leave firstrun
    Wait(selenium, 2).until(
        expected.presence_of_element_located(
            (By.ID, 'action-button--all-aboard-v1-all-aboard')
        )
    )

    # enure that the sidebar is automatically shown on first notification
    Wait(selenium, 10).until(
        expected.presence_of_element_located(
            (By.CSS_SELECTOR, '#content-deck #sidebar-box[sidebarcommand="viewWebPanelsSidebar"]')  # noqa E501
        )
    )
