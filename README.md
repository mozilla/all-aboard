#All Aboard
The Mozilla Firefox onboarding add-on

## Installing All-Aboard

Your first step in trying this, in development add-on, is to tweak your Firefox config a little. Open up Firefox and go to `about:config`. Click on the blue button to acknowledge that you will be careful, and search for:

```
xpinstall.signatures.required
```

[See SUMO if you get stuck](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox?#w_override-add-on-signing-advanced-users)

Double click on the item and it's value should change to false. You can now [download and install](https://github.com/schalkneethling/all-aboard) the add-on.

## All-Aboard

The add-on by itself does not do much at the moment. You can click the little Firefox icon in the toolbar but, it will show an underwhelming 'Hello World' message in a XUL sidebar.

## First run

The more interesing interaction All-Aboard offers is the new interactions on the /firstrun page for Firefox. To see this in action, go to:

```
https://www.mozilla.org//firefox/46.0/firstrun/
```

### The Paths

The above page will show a new dialog asking whether you have used Firefox in the last 30 days, and what matters to you as user. There is also a link to opt out presented as a linked titled "No thanks".

There are currently three paths a user can take from this point:

#### Opt out

* The user clicks the "No thanks" link and is sent to `about:home`
* Internally the user is classified as `no-thanks` and will not be part of the rest of the on-boarding experience.

#### Yup

* The user selects `yup` as the answer to the first question, and clicks Go!.
* A second question is shown to the user.
* The user here either selects "Do it yourself" or "Do good", and clicks Go!.
* The Fx accounts form is shown.
* Internally the user is classified as an `existing` user
* Once the user submits the form or, navigates away from the first run page, the side bar will be shown inviting the user to import their data.

#### Nope

* The user selects `nope` as the answer to the first question
* A second question is shown to the user.
* The user here either selects "Do it yourself" or "Do good", and clicks Go!.
* The Fx accounts form is shown.
* Internally the user is classified as a `new` user
* Once the user submits the form or, navigates away from the first run page, the side bar will be shown inviting the user to import their data.
