import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { ISwapAppService, IAppSetting } from '../interfaces';
import SwapAppSettings from '../core/SwapAppSettings';
import { createBranchWhenNotExist, createPullRequest, gitCommit, gitCommitNewBranch } from '../utils/githubUtiltiy';
import { PathUtility } from '../utils/PathUtility';
import { constants } from '../constants';
import { AppSettingsProviderFactory } from '../core/AppSettingsProviderFactory';
import { AppSettingsType } from '../core/AppSettingsBase';
const { WorkingDirectory, DefaultEncoding, gitConfig } = constants;

interface IGetDeploySlotsOption {
  repo: string;
  ref: string;
  token: string;
  path: string;
}

interface IAppSettingSlots {
  source: IAppSetting[];
  target: IAppSetting[];
}

interface IAppSettingsAllSlots {
  appSettings: IAppSettingSlots;
  simulatedSwappedAppSettings: IAppSettingSlots;
}

export class GetDeploySlots {
  constructor(private swapAppServiceList: ISwapAppService[], private options: IGetDeploySlotsOption) {}

  private async getAppSettingsAllSlots(
    type: AppSettingsType,
    swapAppService: ISwapAppService
  ): Promise<IAppSettingsAllSlots> {
    const appSetting = AppSettingsProviderFactory.getAppSettingsProvider(type, swapAppService);
    (await appSetting.list()).validate().fullfill().mask();

    const swapAppSettings = new SwapAppSettings(swapAppService);
    return {
      appSettings: {
        source: appSetting.getSource(),
        target: appSetting.getTarget(),
      },
      simulatedSwappedAppSettings: {
        source: swapAppSettings.simulateSwappedAppSettings(type, appSetting.getSource(), appSetting.getTarget()),
        target: swapAppSettings.simulateSwappedAppSettings(type, appSetting.getTarget(), appSetting.getSource()),
      },
    };
  }

  private writeAppSettingsFileSync(
    type: AppSettingsType,
    swapAppService: ISwapAppService,
    appSettingsSlots: IAppSettingSlots
  ) {
    const pathUtility = new PathUtility(WorkingDirectory);
    const { resourceGroup, name, slot, targetSlot } = swapAppService;
    const appSettingsSourceSlot = appSettingsSlots.source;
    const appSettingsTargetSlot = appSettingsSlots.target;
    pathUtility.createDir(resourceGroup);
    fs.writeFileSync(
      pathUtility.getAppSettingsPath(type, resourceGroup, name, slot),
      JSON.stringify(appSettingsSourceSlot, null, 2),
      DefaultEncoding
    );
    fs.writeFileSync(
      pathUtility.getAppSettingsPath(type, resourceGroup, name, targetSlot),
      JSON.stringify(appSettingsTargetSlot, null, 2),
      DefaultEncoding
    );
  }

  public async execute() {
    core.debug(`Using get-deploy-slots mode`);
    const { repo, path: targetPath, ref, token: personalAccessToken } = this.options;

    const getAppSettingsWorkers: Promise<IAppSettingsAllSlots>[] = [];
    const getConnectionStringsWorkers: Promise<IAppSettingsAllSlots>[] = [];
    for (const swapAppService of this.swapAppServiceList) {
      getAppSettingsWorkers.push(this.getAppSettingsAllSlots(AppSettingsType.AppSettings, swapAppService));
      getConnectionStringsWorkers.push(this.getAppSettingsAllSlots(AppSettingsType.ConnectionStrings, swapAppService));
    }

    const appSettingsSlotList = await Promise.all(getAppSettingsWorkers);
    const connectionStringsSlotList = await Promise.all(getConnectionStringsWorkers);

    const sharedGitConfig = {
      repo,
      ref,
      personalAccessToken,
      name: gitConfig.name,
      email: gitConfig.email,
    };

    await createBranchWhenNotExist(sharedGitConfig);

    /**
     * Step 2: Commit Marked App Setting (Source Slot)
     */
    const pathUtility = new PathUtility(WorkingDirectory);
    for (let i = 0; i < this.swapAppServiceList.length; i++) {
      this.writeAppSettingsFileSync(
        AppSettingsType.AppSettings,
        this.swapAppServiceList[i],
        appSettingsSlotList[i].appSettings
      );
      this.writeAppSettingsFileSync(
        AppSettingsType.ConnectionStrings,
        this.swapAppServiceList[i],
        connectionStringsSlotList[i].appSettings
      );
    }

    await gitCommit({
      ...sharedGitConfig,
      targetPath,
      rootPath: WorkingDirectory,
      message: 'Get App Setting',
    });
    pathUtility.clean();

    /**
     * Step 3: Simulate if values are swapped (Target Slot)
     */

    for (let i = 0; i < this.swapAppServiceList.length; i++) {
      this.writeAppSettingsFileSync(
        AppSettingsType.AppSettings,
        this.swapAppServiceList[i],
        appSettingsSlotList[i].simulatedSwappedAppSettings
      );
      this.writeAppSettingsFileSync(
        AppSettingsType.ConnectionStrings,
        this.swapAppServiceList[i],
        connectionStringsSlotList[i].simulatedSwappedAppSettings
      );
    }

    // Create tmp file if no change it will be merge
    fs.writeFileSync(
      path.resolve(WorkingDirectory, `timestamp-${new Date().getTime()}`),
      'Force Diff for Preview Change',
      DefaultEncoding
    );

    const newBranch = await gitCommitNewBranch({
      ...sharedGitConfig,
      targetPath,
      rootPath: WorkingDirectory,
      message: 'Get App Setting if app service is swapped',
    });

    await createPullRequest({
      ...sharedGitConfig,
      sourceBranch: newBranch,
    });
  }
}
