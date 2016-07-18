#All Aboard
The Mozilla Firefox onboarding add-on

## Installing All-Aboard

### Prerequisites

* Clone this repo - https://github.com/mozilla/all-aboard/tree/all-aboard-webextension
* You will need a version of Firefox 49 or higher. You best bet is to download and install [Firefox developer edition](https://www.mozilla.org/en-US/firefox/developer/)

### Using about:debugging

* Using the version of Firefox you installed from the prerequisite steps above, go to `about:debugging` in a new tab.
* Next, click on the `Load Temporary Add-on` button.
* Navigate to the directory in which you cloned the repository
* Select the `manifest.json` file
* Click open

You should now see the extension loaded in the list of extensions, and see an orange lightbulb added to the browser chrome. Currently, clicking on the lightbulb, will open a pop-up showing the first card of the values track.

### Using web-ext

If you are working on the development of the add-on, then you also have the option of using the [`web-ext` Nodejs module](https://github.com/mozilla/web-ext). This is to web extensions as `jpm` is to SDK based add-ons.

One of the main reasons to use the Nodejs module during development is because it allows you to specify a specific profile to use when running Firefox instead of using a new temporary profile each time. To start using this, simply follow the [steps detailed in the `web-ext` README](https://github.com/mozilla/web-ext#installation-from-npm)

Once you have installed the module, you can run the extension as follows:

```
web-ext run --firefox-binary /Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin -p 'profile-name'
```
