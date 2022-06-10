import * as core from '@actions/core';
import { wait } from './wait';
import fs from 'fs';
import { executeBatchProcess, executeProcess } from './utility';
import { stripIndent } from 'common-tags';
import { ISwapAppSetting, ISwapAppService, AppSettingProperty } from './interfaces/ISwapAppService';
import { validateInput } from './validateInput';

// async function run(): Promise<void> {
//   try {
//     const ms: string = core.getInput('milliseconds')
//     core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

//     core.debug(new Date().toTimeString())
//     await wait(parseInt(ms, 10))
//     core.debug(new Date().toTimeString())

//     core.setOutput('time', new Date().toTimeString())
//   } catch (error) {
//     if (error instanceof Error) core.setFailed(error.message)
//   }
// }

const azureCommands = {
  webAppListAppSettings: (name: string, resourceGroup: string) => stripIndent`
    az webapp config appsettings list \\
        --name ${name} \\
        --resource-group ${resourceGroup}
`,
};

async function webAppListAppSettings(name: string, resourceGroup: string): Promise<ISwapAppSetting[]> {
  const result = await executeProcess(azureCommands.webAppListAppSettings(name, resourceGroup));
  if (result.stdout instanceof Buffer) {
    return JSON.parse(result.stdout.toString());
  }
  return JSON.parse(result.stdout || '');
}

async function main() {
  const swapAppServiceConfigs: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', 'utf8'));
  validateInput(swapAppServiceConfigs);

  const listAppSettingWorkers: Promise<ISwapAppSetting[]>[] = [];

  for (const config of swapAppServiceConfigs) {
    console.log(config.name);
    listAppSettingWorkers.push(webAppListAppSettings(config.name, config.resourceGroup));
  }
  const result = await Promise.all(listAppSettingWorkers);

  // const result: IAppSetting[] = await webAppListAppSettings('thadaw-demo-multi-app-ant', 'rg-thadaw-demo-multi-app');
  // console.log(result);
}

main();
