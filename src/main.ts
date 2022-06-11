// import * as core from '@actions/core';
import fs from 'fs';
import { ISwapAppService, IAppSetting } from './interfaces/ISwapAppService';
import InputValidation from './validation/InputValidation';
import AppSettingsMasking from './core/AppSettingsMasking';
import SwapAppSettingsValidation from './validation/SwapAppSettings';
import { webAppListAppSettings } from './utils/azureCLI';
import SwapAppSettingsSync from './core/SwapAppSettingsSync';

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
    let swapAppService = swapAppServiceList[i];
    let appSettings = appSettingsList[i];
    // validate appSettings
    const result = new SwapAppSettingsValidation(swapAppService, appSettings).run();
    if (!result.success) throw new Error(result.error);
    swapAppService = new SwapAppSettingsSync(swapAppService, appSettings).run();
    // Make appSettings as sensitve if they are requested
    appSettings = new AppSettingsMasking(swapAppService, appSettings).run();
  }
}

main();
