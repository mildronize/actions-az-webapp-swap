import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { ISwapAppService, IAppSetting } from '../interfaces';
import InputValidation from '../validation/InputValidation';
import AppSettingsMasking from '../core/AppSettingsMasking';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import { webAppListAppSettings } from '../utils/azureUtility';
import SwapAppSettings from '../core/SwapAppSettings';
import { createBranchWhenNotExist, createPullRequest, gitCommit, gitCommitNewBranch } from '../utils/githubUtiltiy';
import { PathUtility } from '../utils/PathUtility';
import { constants } from '../constants';

interface IGetDeploySlotsOption {
  repo: string;
  ref: string;
  token: string;
  path: string;
}

const { WorkingDirectory, DefaultEncoding, gitConfig } = constants;

export class GetDeploySlots {
  constructor() {}

  public async execute(swapAppServiceList: ISwapAppService[], options: IGetDeploySlotsOption) {
    const { repo, path: targetPath, ref, token: personalAccessToken } = options;

    core.debug(`Using get-deploy-slots mode`);

    // const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', DefaultEncoding));
    swapAppServiceList = InputValidation.validateArray(swapAppServiceList);

    const appSettingSourceSlotWorkers: Promise<IAppSetting[]>[] = [];
    const appSettingTargetSlotWorkers: Promise<IAppSetting[]>[] = [];

    for (const config of swapAppServiceList) {
      console.log(config.name);
      appSettingSourceSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.slot));
      appSettingTargetSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.targetSlot));
    }
    const appSettingsSourceSlotList = await Promise.all(appSettingSourceSlotWorkers);
    const appSettingsTargetSlotList = await Promise.all(appSettingTargetSlotWorkers);
    const simulatedSwappedAppSettingsSourceSlotList: IAppSetting[][] = [];
    const simulatedSwappedAppSettingsTargetSlotList: IAppSetting[][] = [];

    for (let i = 0; i < swapAppServiceList.length; i++) {
      let swapAppService = swapAppServiceList[i];
      let appSettingsSourceSlot = appSettingsSourceSlotList[i];
      let appSettingsTargetSlot = appSettingsTargetSlotList[i];
      // Validate appSettings for Source Slot
      new SwapAppSettingsValidation(swapAppService, appSettingsSourceSlot).validate(swapAppService.slot);
      // Validate appSettings for Target Slot
      new SwapAppSettingsValidation(swapAppService, appSettingsTargetSlot).validate(swapAppService.targetSlot);

      const swapAppSettings = new SwapAppSettings(swapAppService);
      swapAppService = swapAppSettings.fullfill(appSettingsSourceSlot, swapAppService.slot);
      swapAppService = swapAppSettings.fullfill(appSettingsTargetSlot, swapAppService.targetSlot);

      // Make appSettings as sensitve if they are requested
      const appSettingMasking = new AppSettingsMasking(swapAppService);
      appSettingsSourceSlot = appSettingMasking.mask(appSettingsSourceSlot, swapAppService.slot);
      appSettingsTargetSlot = appSettingMasking.mask(appSettingsTargetSlot, swapAppService.targetSlot);

      simulatedSwappedAppSettingsSourceSlotList.push(
        swapAppSettings.simulateSwappedAppSettings(appSettingsSourceSlot, appSettingsTargetSlot)
      );
      simulatedSwappedAppSettingsTargetSlotList.push(
        swapAppSettings.simulateSwappedAppSettings(appSettingsTargetSlot, appSettingsSourceSlot)
      );
    }

    await createBranchWhenNotExist({
      repo,
      ref,
      personalAccessToken,
      name: gitConfig.name,
      email: gitConfig.email,
    });

    /**
     * Step 2: Commit Marked App Setting (Source Slot)
     */
    const pathUtility = new PathUtility(WorkingDirectory);
    for (let i = 0; i < swapAppServiceList.length; i++) {
      const { resourceGroup, name, slot, targetSlot } = swapAppServiceList[i];
      const appSettingsSourceSlot = appSettingsSourceSlotList[i];
      const appSettingsTargetSlot = appSettingsTargetSlotList[i];
      pathUtility.createDir(resourceGroup);
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(resourceGroup, name, slot),
        JSON.stringify(appSettingsSourceSlot, null, 2),
        DefaultEncoding
      );
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(resourceGroup, name, targetSlot),
        JSON.stringify(appSettingsTargetSlot, null, 2),
        DefaultEncoding
      );
    }

    await gitCommit({
      targetPath,
      rootPath: WorkingDirectory,
      repo,
      ref,
      personalAccessToken,
      name: gitConfig.name,
      email: gitConfig.email,
      message: 'Get App Setting',
    });
    pathUtility.clean();

    /**
     * Step 3: Simulate if values are swapped (Target Slot)
     */

    for (let i = 0; i < swapAppServiceList.length; i++) {
      const { resourceGroup, name, slot, targetSlot } = swapAppServiceList[i];
      const simulatedSwappedAppSettingsSourceSlot = simulatedSwappedAppSettingsSourceSlotList[i];
      const simulatedSwappedAppSettingsTargetSlot = simulatedSwappedAppSettingsTargetSlotList[i];
      pathUtility.createDir(resourceGroup);
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(resourceGroup, name, slot),
        JSON.stringify(simulatedSwappedAppSettingsSourceSlot, null, 2),
        DefaultEncoding
      );
      fs.writeFileSync(
        pathUtility.getAppSettingsPath(resourceGroup, name, targetSlot),
        JSON.stringify(simulatedSwappedAppSettingsTargetSlot, null, 2),
        DefaultEncoding
      );
    }

    // Create tmp file if no change it will be merge
    fs.writeFileSync(
      path.resolve(WorkingDirectory, `timestamp-${new Date().getTime()}`),
      'Force Diff for Preview Change',
      DefaultEncoding
    );

    const newBranch = await gitCommitNewBranch({
      targetPath,
      rootPath: WorkingDirectory,
      repo,
      ref,
      personalAccessToken,
      name: gitConfig.name,
      email: gitConfig.email,
      message: 'Get App Setting if app service is swapped',
    });

    await createPullRequest({
      name: gitConfig.name,
      email: gitConfig.email,
      personalAccessToken,
      ref,
      repo,
      sourceBranch: newBranch,
    });
  }
}
