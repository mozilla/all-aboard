# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page
from selenium.webdriver.common.by import By

from pages.about_home import AboutHome


class Firstrun(Page):

    URL_TEMPLATE = '/en-US/firefox/47.1/firstrun/'

    _allaboard_dialog_locator = (By.ID, 'all-aboard')
    _dismiss_link_locator = (By.ID, 'dismiss')
    _dismiss_fxa_link_locator = (By.ID, 'dismiss_fxa')
    _fxa_form_locator = (By.CLASS_NAME, 'fxaccounts')
    _questions_one_heading_locator = (By.CSS_SELECTOR, '#all-aboard header h2')
    _submit_button_locator = (By.CSS_SELECTOR, '#all-aboard button')
    _values_radio_element_locator = (By.ID, 'values')
    _what_matters_section_locator = (By.CLASS_NAME, 'what-matters')
    _yup_radio_element_locator = (By.ID, 'yup')

    def wait_for_page_to_load(self):
        self.wait.until(lambda s: self.is_element_displayed(
            *self._allaboard_dialog_locator))
        return self

    @property
    def allaboard_dialog_visible(self):
        return self.is_element_displayed(*self._allaboard_dialog_locator)

    @property
    def dismiss_visible(self):
        return self.is_element_displayed(*self._dismiss_link_locator)

    @property
    def dismiss_fxa_visible(self):
        return self.is_element_displayed(*self._dismiss_fxa_link_locator)

    @property
    def fxa_form_visible(self):
        return self.is_element_displayed(*self._fxa_form_locator)

    @property
    def question_one_heading(self):
        return self.find_element(*self._questions_one_heading_locator).text

    @property
    def submit_button_visible(self):
        return self.is_element_displayed(*self._submit_button_locator)

    @property
    def what_matters_visible(self):
        return self.is_element_displayed(*self._what_matters_section_locator)

    def complete_firstrun_values_flow(self):
        """  completes firstrun flow, setting user on values track """
        self.select_yup()
        self.select_values()
        self.submit_form()
        self.click_dismiss_fxa()

    def click_dismiss(self):
        self.find_element(*self._dismiss_link_locator).click()
        return AboutHome(self).wait_for_page_to_load()

    def click_dismiss_fxa(self):
        self.find_element(*self._dismiss_fxa_link_locator).click()

    def select_yup(self):
        self.find_element(*self._yup_radio_element_locator).click()

    def select_values(self):
        self.find_element(*self._values_radio_element_locator).click()

    def submit_form(self):
        self.find_element(*self._submit_button_locator).click()
