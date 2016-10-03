# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait as Wait

from pages.all_aboard import AllAboard
from pages.firstrun import Firstrun
from pages.sidebar import Sidebar


@pytest.fixture
def complete_firstrun(base_url, selenium):
    """ Completes /firstrun interactions to start on-boarding"""
    page = Firstrun(selenium, base_url).open()
    page.complete_firstrun_values_flow()
    return page


@pytest.fixture
def complete_first_sidebar_interaction(selenium):
    """ Completes interaction on first sidebar to move experience forward"""
    # switch to browser chrome
    selenium.set_context('chrome')

    # wait for the first sidebar to be shown
    Wait(selenium, 3).until(
        expected.presence_of_element_located((
            By.CSS_SELECTOR,
            '#content-deck #sidebar-box[sidebarcommand="viewWebPanelsSidebar"]'
            )
        )
    )

    sidebar = Sidebar(selenium)
    # click the main cta
    sidebar.click_cta()

    return sidebar


@pytest.mark.nondestructive
@pytest.mark.capabilities(firefox_args=['-foreground'])
def test_automatically_show_first_sidebar(base_url,
                                          selenium,
                                          complete_firstrun):
    """ Tests that the first sidebar opens automatically"""
    # switch to browser chrome
    selenium.set_context('chrome')

    # ensure that add-on action button is added as soon as we leave firstrun
    Wait(selenium, 2).until(
        expected.presence_of_element_located(
            (By.ID, 'action-button--all-aboard-v1-all-aboard')
        )
    )

    # enure that the sidebar is automatically shown on first notification
    Wait(selenium, 3).until(
        expected.presence_of_element_located((
            By.CSS_SELECTOR,
            '#content-deck #sidebar-box[sidebarcommand="viewWebPanelsSidebar"]'
            )
        )
    )


@pytest.mark.nondestructive
@pytest.mark.capabilities(firefox_args=['-foreground'])
def test_second_sidebar_not_automatically_shown(
        base_url,
        selenium,
        complete_firstrun,
        complete_first_sidebar_interaction):
    """ Tests that the second sidebar does not open automatically"""
    # switch to browser chrome
    selenium.set_context('chrome')

    # wait for the second notification to happen
    Wait(selenium, 10).until(
        expected.presence_of_element_located((
            By.CSS_SELECTOR,
            '#action-button--all-aboard-v1-all-aboard[badge="1"]'
            )
        )
    )

    all_aboard = AllAboard(selenium)

    # ensure the second sidebar is not automatically shown
    assert all_aboard.sidebar.get_attribute('hidden') == 'true'


def test_second_sidebar_opens_on_click(
        base_url,
        selenium,
        complete_firstrun,
        complete_first_sidebar_interaction):
    """ Tests that the sidebar opens when the ActionButton is clicked"""
    # switch to browser chrome
    selenium.set_context('chrome')

    # wait for the second notification to happen
    notification = Wait(selenium, 10).until(
        expected.presence_of_element_located((
            By.CSS_SELECTOR,
            '#action-button--all-aboard-v1-all-aboard[badge="1"]'
            )
        )
    )

    all_aboard = AllAboard(selenium)
    sidebar = Sidebar(selenium)

    # once the second content notification happens, click the action button
    notification.click()

    # ensure that the sidebar is shown after click on ActionButton
    assert all_aboard.sidebar.get_attribute('hidden') == 'false'
    # ensure that the correct sidebar is shown
    assert sidebar.current_step == '2'
