
- set deploy slot in main slot only

## TODO

- [ ] Mask sensitive in log

## Usage 

```yaml
name: Swap Slots
on:
  workflow_dispatch:
  pull_request:
    types: [opened, closed]
    branches:
      - appsettings
env:
  config_dir: ./.github/workflows/configs
jobs:
  get-matrix:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.get-matrix.outputs.deployment-matrix }}
    steps:
    - uses: actions/checkout@v3
    - name: Export deployment matrix
      id: get-matrix
      run: |
        node ./index.js test-get-deploy-slots.json
      working-directory: ${{ env.config_dir }}

  get-slot-settings:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    needs: [ get-matrix ]
    steps:
      - uses: actions/checkout@v2
      # SP: github action az webapp swap
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.azure_credentials }}
      - uses: mildronize/actions-az-webapp-swap@v0.0.9
        with:
          mode: get-deploy-slots
          config: ${{ needs.get-matrix.outputs.result }}
          token: ${{ secrets.PAT }}
          repo: mildronize/actions-az-webapp-swap-demo
          
  set-slot-settings:
    if: github.event_name == 'pull_request' && github.event.action != 'closed'
    name: ${{ format('⚙️ Set Slot | {0} - {1}', matrix.name, matrix.slot) }}
    needs: [ get-matrix  ]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include: ${{ fromJson(needs.get-matrix.outputs.result) }}
    steps:
      - uses: actions/checkout@v2
      # SP: github action az webapp swap
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.azure_credentials }}
      
      - name: set-slot-settings
        uses: mildronize/actions-az-webapp-swap@v0.0.9
        with: 
          mode: set-deploy-slots
          swap-config: ${{ toJson(matrix) }}

  swap-slot:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    name: ${{ format('🚀 Swap Slot | {0} - {1}', matrix.name, matrix.slot) }}
    needs: [ get-matrix ]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include: ${{ fromJson(needs.get-matrix.outputs.result) }}
    steps:
      - uses: actions/checkout@v2
      # SP: github action az webapp swap
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.azure_credentials }}
      
      - name: set-slot-settings
        uses: mildronize/actions-az-webapp-swap@v0.0.9
        with: 
          mode: swap-slots
          swap-config: ${{ toJson(matrix) }}

  clean:
    name: Clean
    needs: [ swap-slot ]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: clean
        uses: mildronize/actions-az-webapp-swap@v0.0.9
        with: 
          mode: clean
          token: ${{ secrets.PAT }}
          repo: mildronize/actions-az-webapp-swap-demo
```

---

<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.  

If you are new, there's also a simpler introduction.  See the [Hello World JavaScript Action](https://github.com/actions/hello-world-javascript-action)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
