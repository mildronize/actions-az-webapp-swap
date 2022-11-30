import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import fs from 'fs';
import path from 'path';
import { ISwapAppService, IAppSetting } from '../interfaces';
import SwapAppSettings from '../core/SwapAppSettings';
import { PathUtility } from '../utils/PathUtility';
import { constants } from '../constants';
import { AppSettingsProviderFactory } from '../core/AppSettingsProviderFactory';
import { AppSettingsType } from '../core/AppSettingsBase';
import { getArtifactName } from '../utils/commonUtility';
import { executeProcess } from '../utils/executeProcess';
const { WorkingDirectory, DefaultEncoding, gitConfig } = constants;

interface IAppSettingSlots {
  source: IAppSetting[];
  target: IAppSetting[];
}

interface IAppSettingsAllSlots {
  appSettings: IAppSettingSlots;
  simulatedSwappedAppSettings: IAppSettingSlots;
}

export class GetDeploySlots {
  constructor(private swapAppService: ISwapAppService) {}

  private async uploadArtifact(artifactName: string, files: string[]) {
    const artifactClient = artifact.create();
    const rootDirectory = '.';
    const options: artifact.UploadOptions = {
      continueOnError: false,
      retentionDays: 1,
    };

    const uploadResponse = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options);
    core.info(`Upload artifact named, "${uploadResponse.artifactName}" completed!`);
  }

  private async getAppSettingsAllSlots(
    type: AppSettingsType,
    swapAppService: ISwapAppService
  ): Promise<IAppSettingsAllSlots> {
    const appSetting = AppSettingsProviderFactory.getAppSettingsProvider(type, swapAppService);
    await appSetting.loadAppSettings();

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
    appSettingsSlots: IAppSettingSlots,
    rootPath: string
  ): string[] {
    const pathUtility = new PathUtility(rootPath);
    const { resourceGroup, name, slot, targetSlot } = swapAppService;
    const appSettingsSourceSlot = appSettingsSlots.source;
    const appSettingsTargetSlot = appSettingsSlots.target;
    pathUtility.createDir(resourceGroup);
    const sourceSlotPath = pathUtility.getAppSettingsPath(type, resourceGroup, name, slot);
    const targetSlotPath = pathUtility.getAppSettingsPath(type, resourceGroup, name, targetSlot);
    fs.writeFileSync(sourceSlotPath, JSON.stringify(appSettingsSourceSlot, null, 2), DefaultEncoding);
    fs.writeFileSync(targetSlotPath, JSON.stringify(appSettingsTargetSlot, null, 2), DefaultEncoding);
    return [sourceSlotPath, targetSlotPath];
  }

  public async execute() {
    core.debug(`Using get-deploy-slots mode`);
    const appSettingsSlot = await this.getAppSettingsAllSlots(AppSettingsType.AppSettings, this.swapAppService);
    const connectionStringsSlot = await this.getAppSettingsAllSlots(
      AppSettingsType.ConnectionStrings,
      this.swapAppService
    );

    const { beforeSwap, afterSwap, root: rootPath } = WorkingDirectory;
    const beforeSwapPath = path.join(rootPath, beforeSwap);
    const afterSwapPath = path.join(rootPath, afterSwap);

    const outputPaths: string[] = [];
    /**
     * Step 2: Commit Marked App Setting (Source Slot)
     */

    outputPaths.push(
      ...this.writeAppSettingsFileSync(
        AppSettingsType.AppSettings,
        this.swapAppService,
        appSettingsSlot.appSettings,
        beforeSwapPath
      )
    );
    outputPaths.push(
      ...this.writeAppSettingsFileSync(
        AppSettingsType.ConnectionStrings,
        this.swapAppService,
        connectionStringsSlot.appSettings,
        beforeSwapPath
      )
    );

    /**
     * Step 3: Simulate if values are swapped (Target Slot)
     */

    outputPaths.push(
      ...this.writeAppSettingsFileSync(
        AppSettingsType.AppSettings,
        this.swapAppService,
        appSettingsSlot.simulatedSwappedAppSettings,
        afterSwapPath
      )
    );
    outputPaths.push(
      ...this.writeAppSettingsFileSync(
        AppSettingsType.ConnectionStrings,
        this.swapAppService,
        connectionStringsSlot.simulatedSwappedAppSettings,
        afterSwapPath
      )
    );

    const { name, slot, targetSlot } = this.swapAppService;
    await this.uploadArtifact(getArtifactName(name, slot, targetSlot), outputPaths);
  }
}
