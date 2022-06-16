import * as core from '@actions/core';
import fs from 'fs';
import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';
import InputValidation from '../validation/InputValidation';
import AppSettingsMasking from '../core/AppSettingsMasking';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import { webAppListAppSettings } from '../utils/azureUtility';
import SwapAppSettings from '../core/SwapAppSettings';
import { createBranchWhenNotExist, gitCommit, gitCommitNewBranch } from '../utils/githubUtiltiy';
import { PathUtility } from '../utils/PathUtility';
import { constants } from '../constants';

interface IGetDeploySlotsOption {
  repo: string;
  ref: string;
  token: string;
  path: string;
}

const { WorkingDirectory, DefaultEncoding } = constants;

export class GetDeploySlots {
  constructor() {}

  public async execute(swapAppServiceList: ISwapAppService[], options: IGetDeploySlotsOption) {
    const { repo, path: targetPath, ref, token: personalAccessToken } = options;

    core.debug(`Using get-deploy-slots mode`);

    // const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', DefaultEncoding));
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
    const simulatedSwappedAppSettingsList: IAppSetting[][] = [];

    for (let i = 0; i < swapAppServiceList.length; i++) {
      let swapAppService = swapAppServiceList[i];
      let appSettingsSourceSlot = appSettingsSourceSlotList[i];
      let appSettingsTargetSlot = appSettingsTargetSlotList[i];
      // Validate appSettings for Source Slot
      this.validateSwapAppServiceSlot(swapAppService, appSettingsSourceSlot, swapAppService.slot);
      // Validate appSettings for Target Slot
      this.validateSwapAppServiceSlot(swapAppService, appSettingsTargetSlot, swapAppService.targetSlot);

      const swapAppSettings = new SwapAppSettings(swapAppService);
      swapAppService = swapAppSettings.fullfill(appSettingsSourceSlot, swapAppService.slot);
      swapAppService = swapAppSettings.fullfill(appSettingsTargetSlot, swapAppService.targetSlot);

      // Make appSettings as sensitve if they are requested
      const appSettingMasking = new AppSettingsMasking(swapAppService);
      appSettingsSourceSlot = appSettingMasking.mask(appSettingsSourceSlot, swapAppService.slot);
      appSettingsTargetSlot = appSettingMasking.mask(appSettingsTargetSlot, swapAppService.targetSlot);

      simulatedSwappedAppSettingsList.push(
        swapAppSettings.simulateSwappedAppSettings(appSettingsSourceSlot, appSettingsTargetSlot)
      );
    }

    await createBranchWhenNotExist({
      repo,
      ref,
      personalAccessToken,
      name: 'GitHub Action Swap Bot',
      email: 'github-swap-bot@github.com',
      message: 'Init new branch for App Setting',
    });

    /**
     * Step 2: Commit Marked App Setting (Source Slot)
     */
    const pathUtility = new PathUtility(WorkingDirectory);
    for (let i = 0; i < swapAppServiceList.length; i++) {
      const swapAppService = swapAppServiceList[i];
      const appSettingsSourceSlot = appSettingsSourceSlotList[i];
      pathUtility.createDir(swapAppService.resourceGroup);
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(swapAppService.resourceGroup, swapAppService.name),
        JSON.stringify(appSettingsSourceSlot, null, 2),
        DefaultEncoding
      );
    }

    await gitCommit({
      targetPath,
      rootPath: WorkingDirectory,
      repo,
      ref,
      personalAccessToken,
      name: 'GitHub Action Swap Bot',
      email: 'github-swap-bot@github.com',
      message: 'Get App Setting',
    });
    pathUtility.clean();

    /**
     * Step 3: Simulate if values are swapped (Target Slot)
     */

    for (let i = 0; i < swapAppServiceList.length; i++) {
      const swapAppService = swapAppServiceList[i];
      const simulatedSwappedAppSettings = simulatedSwappedAppSettingsList[i];
      pathUtility.createDir(swapAppService.resourceGroup);
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(swapAppService.resourceGroup, swapAppService.name),
        JSON.stringify(simulatedSwappedAppSettings, null, 2),
        DefaultEncoding
      );
    }

    await gitCommitNewBranch({
      targetPath,
      rootPath: WorkingDirectory,
      repo,
      ref,
      personalAccessToken,
      name: 'GitHub Action Swap Bot',
      email: 'github-swap-bot@github.com',
      message: 'Get App Setting if app service is swapped',
    });
  }

  private validateSwapAppServiceSlot(swapAppService: ISwapAppService, appSettings: IAppSetting[], slot: string) {
    core.debug(`Validating SwapAppService config with slot: ${slot}`);
    const result = new SwapAppSettingsValidation(swapAppService, appSettings).run();
    if (!result.success) throw new Error(`Invalid SwapAppService config with slot (${slot}): ${result.error}`);
  }
}
