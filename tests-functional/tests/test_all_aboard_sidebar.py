# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pytest

from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait as Wait

from pages.firstrun import Firstrun


@pytest.fixture
def complete_firstrun(base_url, selenium):
    """ Completes /firstrun interactions to start on-boarding"""
    page = Firstrun(selenium, base_url).open()
    page.complete_firstrun_values_flow()
    return page


@pytest.mark.nondestructive
@pytest.mark.capabilities(firefox_args=['-foreground'])
def test_three_notifications_shown(base_url,
                                   selenium,
                                   complete_firstrun):
    """ Tests that three notifications are shown for a sidebar"""
    # switch to browser chrome
    selenium.set_context('chrome')

    # ensure that add-on action button is added as soon as we leave firstrun
    action = Wait(selenium, 2).until(
        expected.presence_of_element_located(
            (By.ID, 'action-button--all-aboard-v12-all-aboard')))

    # first sidebar is automatically shown on first notification so,
    # we use this as out indicator that the first notifications happened.
    Wait(selenium, 3).until(
        expected.presence_of_element_located((
            By.CSS_SELECTOR,
            '#content-deck #sidebar-box[sidebarcommand="viewWebPanelsSidebar"]')  # noqa E501
        ))

    # wait for the second notification to happen
    Wait(selenium, 15).until(
        lambda s: action.get_attribute('badge') == '1'
    )

    # click the action button, this should not stop
    # the third notification from happening
    action.click()
    assert action.get_attribute('badge') == ''

    # wait for the third notification to happen
    Wait(selenium, 15).until(
        lambda s: action.get_attribute('badge') == '1'
    )

    # clicking the action button does not affect the notification,
    # here it is simply used to reset the badge attrbiute to ""
    action.click()
    assert action.get_attribute('badge') == ''

    # there should not be a fourth notification
    with pytest.raises(TimeoutException):
        Wait(selenium, 15).until(
            lambda s: action.get_attribute('badge') == '1'
        )
