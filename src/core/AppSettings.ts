import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import InputValidation from '../validation/InputValidation';
import SwapAppSettings from './SwapAppSettings';
import path from 'path';
import fs from 'fs';
import { webAppListAppSettings, webAppSetAppSettings } from '../utils/azureUtility';

interface IAppSettingOption {
  defaultEncoding: fs.WriteFileOptions;
  workingDirectory: string;
}

export default class AppSettings {
  private source: IAppSetting[] = [];
  private target: IAppSetting[] = [];
  private options: IAppSettingOption = {
    defaultEncoding: 'utf8',
    workingDirectory: 'swap-tmp-path',
  };

  constructor(private swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    options = options ? options : {};
    if (options.defaultEncoding) this.options.defaultEncoding = options.defaultEncoding;
    if (options.workingDirectory) this.options.workingDirectory = options.workingDirectory;
  }

  public async list() {
    core.info('Validating Action Input...');
    this.swapAppService = InputValidation.validate(this.swapAppService);
    core.info('Listing App Setting from Azure Web App (Azure App Service) ...');
    const { name, resourceGroup, slot, targetSlot } = this.swapAppService;
    [this.source, this.target] = await Promise.all([
      webAppListAppSettings(name, resourceGroup, slot),
      webAppListAppSettings(name, resourceGroup, targetSlot),
    ]);
    return this;
  }

  public fullfill() {
    core.info('Fullfilling Swap config with App Setting');
    const swapAppSettings = new SwapAppSettings(this.swapAppService);
    this.swapAppService = swapAppSettings.fullfill(this.source, this.swapAppService.slot);
    this.swapAppService = swapAppSettings.fullfill(this.target, this.swapAppService.targetSlot);
    return this;
  }

  public apply() {
    // Apply new value slot settings
    core.info('Applying slot setting into App Setting');
    const swapAppSettings = new SwapAppSettings(this.swapAppService);
    this.source = swapAppSettings.applyAppSetting(this.source);
    this.target = swapAppSettings.applyAppSetting(this.target);
    return this;
  }

  public async set(slotType: SlotType) {
    const { appSettings, slot } = this.getSlotConfig(slotType);
    const { workingDirectory, defaultEncoding } = this.options;
    const { name, resourceGroup } = this.swapAppService;
    const appSettingPath = path.resolve(workingDirectory, `${name}-${slot}`);
    if (!fs.existsSync(workingDirectory)) fs.mkdirSync(workingDirectory, { recursive: true });
    fs.writeFileSync(appSettingPath, JSON.stringify(appSettings), defaultEncoding);
    core.info('Start set app Setting');
    await webAppSetAppSettings(name, resourceGroup, slot, appSettingPath);
    core.info('Removing file');
    fs.rmSync(appSettingPath, { force: true });
  }

  private getSlotConfig(slotOption: SlotType) {
    if (slotOption === 'source')
      return {
        appSettings: this.source,
        slot: this.swapAppService.slot,
      };
    if (slotOption === 'target')
      return {
        appSettings: this.target,
        slot: this.swapAppService.targetSlot,
      };
    throw new Error(`getSlotConfig requires 'source' or 'target'`);
  }

  public getSource() {
    return this.source;
  }

  public getTarget() {
    return this.target;
  }
}
