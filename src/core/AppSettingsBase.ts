import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import InputValidation from '../validation/InputValidation';
import SwapAppSettings from './SwapAppSettings';
import path from 'path';
import fs from 'fs';
import { webAppListAppSettings, webAppSetAppSettings } from '../utils/azureUtility';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import AppSettingsMasking from './AppSettingsMasking';

export enum AppSettingsType {
  AppSettings = 'AppSettings',
  ConnectionStrings = 'ConnectionStrings',
}

export interface IAppSettingOption {
  defaultEncoding: fs.WriteFileOptions;
  workingDirectory: string;
}

export default abstract class AppSettingsBase {
  protected source: IAppSetting[] = [];
  protected target: IAppSetting[] = [];
  protected options: IAppSettingOption = {
    defaultEncoding: 'utf8',
    workingDirectory: 'swap-tmp-path',
  };

  constructor(protected swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    options = options ? options : {};
    if (options.defaultEncoding) this.options.defaultEncoding = options.defaultEncoding;
    if (options.workingDirectory) this.options.workingDirectory = options.workingDirectory;
    core.info('Validating Action Input...');
    this.swapAppService = InputValidation.validate(this.swapAppService);
  }

  /**
   * call `list()` function after create a object
   * @returns AppSettings
   */
  public async list() {
    return this;
  }

  public async set(slotType: SlotType) {}

  public validate() {
    new SwapAppSettingsValidation(this.swapAppService, this.source).validate(this.swapAppService.slot);
    new SwapAppSettingsValidation(this.swapAppService, this.source).validate(this.swapAppService.targetSlot);
    return this;
  }

  public mask() {
    // Make appSettings as sensitve if they are requested
    const appSettingMasking = new AppSettingsMasking(this.swapAppService);
    this.source = appSettingMasking.mask(this.source, this.swapAppService.slot);
    this.target = appSettingMasking.mask(this.target, this.swapAppService.targetSlot);
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

  protected getSlotConfig(slotOption: SlotType) {
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
