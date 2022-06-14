import * as core from '@actions/core';
import fs from 'fs';
import { ISwapAppService, IAppSetting } from './interfaces/ISwapAppService';
import InputValidation from './validation/InputValidation';
import AppSettingsMasking from './core/AppSettingsMasking';
import SwapAppSettingsValidation from './validation/SwapAppSettings';
import { webAppListAppSettings } from './utils/azureCLI';
import SwapAppSettings from './core/SwapAppSettings';

function validateSwapAppServiceSlot(swapAppService: ISwapAppService, appSettings: IAppSetting[], slot: string) {
  core.debug(`Validating SwapAppService config with slot: ${slot}`);
  const result = new SwapAppSettingsValidation(swapAppService, appSettings).run();
  if (!result.success) throw new Error(`Invalid SwapAppService config with slot (${slot}): ${result.error}`);
}

async function main() {
  const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', 'utf8'));
  new InputValidation(swapAppServiceList).validate();

  const appSettingSourceSlotWorkers: Promise<IAppSetting[]>[] = [];
  const appSettingTargetSlotWorkers: Promise<IAppSetting[]>[] = [];

  for (const config of swapAppServiceList) {
    console.log(config.name);
    appSettingSourceSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.slot));
    appSettingTargetSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.targetSlot));
  }
  const appSettingsSourceSlotList = await Promise.all(appSettingSourceSlotWorkers);
  const appSettingsTargetSlotList = await Promise.all(appSettingTargetSlotWorkers);

  for (let i = 0; i < swapAppServiceList.length; i++) {
    let swapAppService = swapAppServiceList[i];
    let appSettingsSourceSlot = appSettingsSourceSlotList[i];
    let appSettingsTargetSlot = appSettingsTargetSlotList[i];
    // Validate appSettings for Source Slot
    validateSwapAppServiceSlot(swapAppService, appSettingsSourceSlot, swapAppService.slot);
    // Validate appSettings for Target Slot
    validateSwapAppServiceSlot(swapAppService, appSettingsTargetSlot, swapAppService.targetSlot);

    const swapAppSettings = new SwapAppSettings(swapAppService);
    swapAppService = swapAppSettings.fullfill(appSettingsSourceSlot, swapAppService.slot);
    swapAppService = swapAppSettings.fullfill(appSettingsTargetSlot, swapAppService.targetSlot);

    // // Make appSettings as sensitve if they are requested
    // appSettingsSourceSlot = new AppSettingsMasking(swapAppService, appSettingsSourceSlot).run();
  }
}

main();
