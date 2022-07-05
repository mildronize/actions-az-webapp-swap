import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { ISwapAppService, IAppSetting } from '../interfaces';
import SwapAppSettings from '../core/SwapAppSettings';
import { createBranchWhenNotExist, createPullRequest, gitCommit, gitCommitNewBranch } from '../utils/githubUtiltiy';
import { PathUtility } from '../utils/PathUtility';
import { constants } from '../constants';
import AppSettings from '../core/AppSettings';

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

interface IGetDeploySlot {
  appSettings: IAppSettingSlots;
  simulatedSwappedAppSettings: IAppSettingSlots;
}

const { WorkingDirectory, DefaultEncoding, gitConfig } = constants;

export class GetDeploySlots {
  constructor() {}

  private async getDeploySlot(swapAppService: ISwapAppService): Promise<IGetDeploySlot> {
    const appSetting = new AppSettings(swapAppService);
    (await appSetting.list()).validate().fullfill().mask();

    const swapAppSettings = new SwapAppSettings(swapAppService);
    return {
      appSettings: {
        source: appSetting.getSource(),
        target: appSetting.getTarget(),
      },
      simulatedSwappedAppSettings: {
        source: swapAppSettings.simulateSwappedAppSettings(appSetting.getSource(), appSetting.getTarget()),
        target: swapAppSettings.simulateSwappedAppSettings(appSetting.getTarget(), appSetting.getSource()),
      },
    };
  }

  private writeAppSettingsFileSync(swapAppService: ISwapAppService, appSettingsSlots: IAppSettingSlots) {
    const pathUtility = new PathUtility(WorkingDirectory);
    const { resourceGroup, name, slot, targetSlot } = swapAppService;
    const appSettingsSourceSlot = appSettingsSlots.source;
    const appSettingsTargetSlot = appSettingsSlots.target;
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

  public async execute(swapAppServiceList: ISwapAppService[], options: IGetDeploySlotsOption) {
    const { repo, path: targetPath, ref, token: personalAccessToken } = options;

    core.debug(`Using get-deploy-slots mode`);

    // const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', DefaultEncoding));
    const getDeploySlotWorkers: Promise<IGetDeploySlot>[] = [];
    for (const swapAppService of swapAppServiceList) {
      getDeploySlotWorkers.push(this.getDeploySlot(swapAppService));
    }
    const deploySlotList = await Promise.all(getDeploySlotWorkers);

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
    for (let i = 0; i < swapAppServiceList.length; i++) {
      this.writeAppSettingsFileSync(swapAppServiceList[i], deploySlotList[i].appSettings);
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

    for (let i = 0; i < swapAppServiceList.length; i++) {
      this.writeAppSettingsFileSync(swapAppServiceList[i], deploySlotList[i].simulatedSwappedAppSettings);
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
