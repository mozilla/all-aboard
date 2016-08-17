# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from pypom import Page


class Sidebar(Page):

    def click_cta(self):
        return self.selenium.execute_script("""
            var cta = document.querySelector('#sidebar').contentDocument
                              .querySelector('#web-panels-browser').contentDocument
                              .querySelector('main button');
            cta.click();
        """)
