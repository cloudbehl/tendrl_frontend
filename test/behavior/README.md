End to End Testing
=======

Feature files are living documentation. They hold functionality of the code described in a DSL understandeable as plain english. This DSL is then parsed by programming-language-specific libraries, and translated into end-to-end tests.
Please refer to cucumber/behave documentation to get started regarding the gherkin syntax, what are step definitions etc.

Framework
----
The Gherkin syntax is used to describe features/scenarios.
Behave is used to run our tests, with selenium on Firefox.

Tags
----
The @skip tag may be used to skip scenarios or entire features if needed.

Directory Structure
----
- `features/` has feature files, in the Given, When, Then Gherkin syntax
- Inside the `features/` directory, the `.feature` files are categorized into Inventory (Cluster, Host, File-share , Pool etc), and a `common` directory, which holds features that are common to all Inventory or do not belong to any stream
- `steps/` has step definitions

Requirements
---
- Xvfb _To be able to run selenium in headless mode_

Installation
----
```
git clone https://github.com/Tendrl/dashboard.git
cd dashboard
git checkout upstream/behaviour_tests
cd test/behavior
pip install behave
pip install selenium
pip install pyyaml
pip install xvfbwrapper # Only if you want to run browser in headless mode
```

Configuration Settings
----
`config/settings.yml` provides configuration options for all environments (development/qa/stage).
The default environment is 'development', but can be specified as `DASHBOARD_ENV` environment variable.

For example: To use the DASHBOARD URL from the QA environment:
1. Enter value for DASHBOARD uri in settings.yml, qa: section
2. Set 'DASHBOARD_ENV' with following command:
   `export DASHBOARD_ENV=qa`

'config/settings.yml' is loaded to context.data variable in order for it to be used globally across behave scripts. Please add your config structure to `config/settings.yml` first and the you can retrieve it from context.data.

Run Tests
----
From the project root,

`behave # for python`

Headless mode
----
For running on systems without a display (such as jenkins), we need to use headless mode.

- Install Xvfb. `xorg-X11-server-Xvfb` on fedora/RHEL
- For python, install xvfbwrapper: `pip install xvfbwrapper`

Tests can be run in headless mode by setting the `DASHBOARD_HEADLESS` environment variable to true
