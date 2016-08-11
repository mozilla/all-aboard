[![Build Status](https://travis-ci.org/mozilla/all-aboard.svg?branch=master)](https://travis-ci.org/mozilla/all-aboard)

#All Aboard
The Mozilla Firefox Educational Tool

## Installing All-Aboard

Your first step in trying this, in development add-on, is to tweak your Firefox config a little. Open up Firefox and go to `about:config`. Click on the blue button to acknowledge that you will be careful, and search for:

```
xpinstall.signatures.required
```

[See SUMO if you get stuck](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox?#w_override-add-on-signing-advanced-users)

Double click on the item and it's value should change to false. You can now [download and install](https://github.com/mozilla/all-aboard) the add-on.

## First run

In order to trigger the onboarding experiment, you must visit the firstrun page and answer the two questions your are prompted with.

```
https://www.mozilla.org/firefox/47.0/firstrun/
```

## Contributing

To run the add-on during development and testing, you will need to first follow the `jpm` installation instructions found on MDN here:
https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation

Once installed you can launch the add-on as follows:

```
jpm run --binary-args www.mozilla.org/en-US/firefox/47.0/firstrun/
```

To run the addon in keeping with proper sessioning, you can launch the addon using:
```
jpm run --binary-args www.mozilla.org/en-US/firefox/47.0/firstrun/ --profile PROFILE_NAME --no-copy
```

To ease development and testing of the add-on, it is possible to configure the time intervals and elapsed time formula using a JSON config file.

In the root of the project folder, add a file called `config.json` as follows:

```
{
    "afterInteractionCloseTime": 5000,
    "defaultSidebarInterval": 10,
    "defaultSidebarCloseTime": 7000,
    "timeElapsedFormula": 1000,
    "waitInterval": 10000
}
```

The values are defined as follows:

* `afterInteractionCloseTime` - The amount of time to wait before auto closing the sidebar after user interaction.
* `defaultSidebarInterval` - Time between sidebars defined in seconds
* `defaultSidebarCloseTime` - Time to wait before auto closing the sidebar if there is no interaction by the user.
* `timeElapsedFormula` - This is the formula used to convert milliseconds to either minutes, hours etc. If you for example set this to `1000`, it will devide the milliseconds to seconds.
* `waitInterval` - This is the interval, set in milliseconds, that the timer will wait until triggering the next badge update and notification.

If the above file is not present, the add-on will use it’s defaults of 24 hours.

### Functional tests

Functional tests are implemented using Selenium and the python Marionette client to allow access to both web content and the browser chrome.

To write and run the tests you need a couple of additional dependecies:

* (Python)[https://www.python.org/]
* (Virtualenvwrapper)[https://pypi.python.org/pypi/virtualenvwrapper]
* (Gecko Driver)[https://github.com/mozilla/geckodriver/releases]

Once you have the above installed, create a virtual environment for the project:

```
mkvirtualenv all-aboard
```

Once the environment has been created, you need to install Tox:

```
pip install tox
```

In order to run the tests, you will either have to have the `geckodriver` on your path or, pass it on the command line. To add it to your path, run the following:

```
export PATH=$PATH:/path/to/gecko/driver/
```

Note that currently you need the change the name of the driver from `geckodriver` to `wires` or else selenium will not detect the driver.

Run the tests with Tox:

```
tox -e tests
```

You can also specifiy a specific Firefox binary to run the tests again as follows:

```
tox -e tests -- --firefox-path=/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox
```
