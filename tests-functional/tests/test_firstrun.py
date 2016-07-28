# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pytest

from pages.firstrun import Firstrun


@pytest.mark.nondestructive
def test_open_firstrun_page(base_url, selenium):
    page = Firstrun(selenium, base_url).open()
    # ensure all-aboard dialog heading text match
    assert 'Have you used Firefox in the last 30 days?' == page.question_one_heading  # noqa E501
    # ensure Firefox accounts form is not visible
    assert not page.fxa_form_visible


@pytest.mark.nondestructive
def test_firstrun_allaboard_dialog_interaction(base_url, selenium):
    page = Firstrun(selenium, base_url).open()
    # confirms that the second part of the survey is not initially visible
    assert not page.what_matters_visible
    # ensure the Go! button is not visible
    assert not page.submit_button_visible
    # ensure that the no thanks link is visible
    assert page.dismiss_visible

    page.select_yup()
    # confirms that the second part of the survey is shown
    assert page.what_matters_visible
    # ensure the Go! button is still not visible
    assert not page.submit_button_visible
    # ensure that after first interaction, dismiss link is hidden
    assert not page.dismiss_visible

    page.select_values()
    # ensure the Go! button is visible
    assert page.submit_button_visible
    # ensure dismiss link is still hidden
    assert not page.dismiss_visible

    page.submit_form()
    # after golden questions answered, ensure all-aboard dialog is hidden
    assert not page.allaboard_dialog_visible
    # ensure that the Firefox accounts form is visible
    assert page.fxa_form_visible
    # ensure that the dismiss link is visible again
    assert page.dismiss_fxa_visible

    # Click No thanks and ensure the user is sent to about:home
    page.click_dismiss_fxa()


@pytest.mark.nondestructive
def test_dismiss_onboarding(base_url, selenium):
    page = Firstrun(selenium, base_url).open()
    # confirms that the second part of the survey is not initially visible
    assert not page.what_matters_visible
    # ensure the Go! button is not visible
    assert not page.submit_button_visible
    # ensure that the no thanks link is visible
    assert page.dismiss_visible

    # Click No thanks and ensure the user is sent to about:home
    page.click_dismiss()
