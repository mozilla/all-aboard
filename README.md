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

The above page will show a new widget asking you do indentify yourself as a new user of Firefox or, and existing user. There is also a link to opt out of this entitled "No thanks".

* Should you click the "No thanks" link, you will be sent to `about:home`
* Should you click "No", you will be presented with Firefox Accounts widget.
* Should you click "Yes", you will be presented with another question. On selecting either of the options, you will be presented with the Firefox Accounts widget.
