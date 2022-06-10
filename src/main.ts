import * as core from '@actions/core';
import { wait } from './wait';
import { executeBatchProcess, executeProcess } from './utility';
import { stripIndent } from 'common-tags';
import { IAppSetting, ISwapAppService } from './interfaces/ISwapAppService';

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
  webAppListApplicationSettings: (name: string, resourceGroup: string) => stripIndent`
    az webapp config appsettings list \\
        --name ${name} \\
        --resource-group ${resourceGroup}
`,
};

async function webAppListApplicationSettings(name: string, resourceGroup: string): Promise<IAppSetting[]> {
  const result = await executeProcess(azureCommands.webAppListApplicationSettings(name, resourceGroup));
  if (result.stdout instanceof Buffer) {
    return JSON.parse(result.stdout.toString());
  }
  return JSON.parse(result.stdout || '');
}

async function validateInput(input: ISwapAppService[]) {}

async function main() {
  const input: ISwapAppService[] = [
    {
      name: 'thadaw-demo-multi-app-ant',
      resourceGroup: 'rg-thadaw-demo-multi-app',
      slot: 'production',
      targetSlot: 'staging',
      defaultSlotSetting: 'required',
      defaultSensitive: 'required',
      appSettings: [
        { name: 'ANOTHER', sensitive: false, slotSetting: true },
        { name: 'Test', sensitive: true, slotSetting: true },
      ],
    },
  ];
  validateInput(input);
  const result = await webAppListApplicationSettings('thadaw-demo-multi-app-ant', 'rg-thadaw-demo-multi-app');
  console.log(result);
}

main();
