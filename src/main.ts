// import * as core from '@actions/core';
import fs from 'fs';
import { ISwapAppService, IAppSetting } from './interfaces/ISwapAppService';
import InputValidation from './validation/InputValidation';
import { ValueMasking } from './core/ValueMasking';
import SwapAppSettings from './validation/SwapAppSettings';
import { webAppListAppSettings } from './utils/azureCLI';

async function main() {
  const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', 'utf8'));
  new InputValidation(swapAppServiceList).validate();

  const listAppSettingWorkers: Promise<IAppSetting[]>[] = [];

  for (const config of swapAppServiceList) {
    console.log(config.name);
    listAppSettingWorkers.push(webAppListAppSettings(config.name, config.resourceGroup));
  }
  const appSettingsList = await Promise.all(listAppSettingWorkers);
  for (let i = 0; i < swapAppServiceList.length; i++) {
    const swapAppService = swapAppServiceList[i];
    const appSettings = appSettingsList[i];
    // validate appSettings
    const result = new SwapAppSettings(swapAppService, appSettings).validate();
    if (!result.success) throw new Error(result.error);
    // Make appSettings as sensitve if they are requested
    appSettingsList[i] = new ValueMasking(swapAppService, appSettings).mask();
  }
}

main();
