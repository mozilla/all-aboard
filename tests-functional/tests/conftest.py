# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pytest
import os


@pytest.fixture
def firefox_profile(firefox_profile):
    # allow unsigned add-on
    firefox_profile.set_preference('xpinstall.signatures.required', False)
    # install extension, get path relative the cwd in which tox is run so,
    # tests-functional in this case.
    firefox_profile.add_extension(extension=os.path.abspath('../@all-aboard-v1-1.1.0.xpi'))  # noqa: E501
    return firefox_profile
