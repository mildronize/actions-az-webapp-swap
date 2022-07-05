import {
  ISwapAppService,
  IAppSetting,
  DefaultSlotSettingEnum,
  DefaultSensitiveEnum,
  ISwapAppSetting,
} from '../interfaces';
import * as core from '@actions/core';
import { constants } from '../constants';
import { findAppSettingName } from '../utils/swapAppSettingsUtility';

const { FallbackValue } = constants;

export default class SwapAppSettings {
  constructor(private swapAppService: ISwapAppService) {}

  /**
   * Expected result
   * Using `defaultSlotSetting` and `defaultSensitive` to generate fullfill JSON for non-required field
   */
  public fullfill(appSettings: IAppSetting[], slot: string) {
    if (this.swapAppService.defaultSlotSetting === DefaultSlotSettingEnum.required)
      core.info(`Cannot fulfill swap app service from giving app setting because all slotSettings is required`);
    if (this.swapAppService.defaultSensitive === DefaultSensitiveEnum.required)
      core.info(`Cannot fulfill swap app service from giving app setting because all sensitive is required`);

    for (const appSetting of appSettings) {
      const found = findAppSettingName(appSetting.name, this.swapAppService.appSettings);
      if (found < 0) {
        this.swapAppService.appSettings.push(this.generateAppSetting(appSetting));
      } else {
        // If existing it will merge between 2 app settings
        let foundAppSetting = this.swapAppService.appSettings[found];
        foundAppSetting = this.mergeAppSettings(appSetting, foundAppSetting);
      }
    }

    for (const appSetting of this.swapAppService.appSettings) {
      if (appSetting.slots) appSetting.slots.push(slot);
      else appSetting.slots = [slot];
    }
    return this.swapAppService;
  }

  private generateAppSetting(appSetting: IAppSetting): ISwapAppSetting {
    // Prepare Sensitive
    const sensitive =
      this.swapAppService.defaultSensitive === DefaultSensitiveEnum.false ? false : FallbackValue.sensitive;
    // Prepare slotSetting
    let slotSetting =
      this.swapAppService.defaultSlotSetting === DefaultSlotSettingEnum.inherit
        ? appSetting.slotSetting
        : FallbackValue.slotSetting;
    slotSetting =
      this.swapAppService.defaultSlotSetting === DefaultSlotSettingEnum.false ? false : FallbackValue.slotSetting;
    return {
      name: appSetting.name,
      sensitive,
      slotSetting,
      // It will use for merging between 2 app settings
      baseSlotSetting: appSetting.slotSetting,
    };
  }

  private mergeAppSettings(appSetting: IAppSetting, swapAppSetting: ISwapAppSetting) {
    if (swapAppSetting.baseSlotSetting !== undefined) {
      swapAppSetting.baseSlotSetting = swapAppSetting.baseSlotSetting || appSetting.slotSetting;
      swapAppSetting.slotSetting = swapAppSetting.slotSetting || appSetting.slotSetting;
    } else {
      swapAppSetting.baseSlotSetting = appSetting.slotSetting;
    }
    return swapAppSetting;
  }

  public simulateSwappedAppSettings(
    sourceSlotAppSettings: IAppSetting[],
    targetSlotAppSettings: IAppSetting[]
  ): IAppSetting[] {
    /**
     * If SlotSetting = True,  Get value from source Slot,
     * If SlotSetting = Flase, Get value from target Slot.
     */
    const result: IAppSetting[] = [];
    for (const swapAppSettings of this.swapAppService.appSettings) {
      let appSetting: Record<string, any> = { name: swapAppSettings.name, slotSetting: swapAppSettings.slotSetting };
      const foundSourceIndex = findAppSettingName(swapAppSettings.name, sourceSlotAppSettings);
      const foundTargetIndex = findAppSettingName(swapAppSettings.name, targetSlotAppSettings);
      if (swapAppSettings.slotSetting === true) {
        if (foundSourceIndex >= 0) {
          appSetting.value = sourceSlotAppSettings[foundSourceIndex].value;
          result.push(appSetting as IAppSetting);
        }
      } else {
        if (foundTargetIndex >= 0) {
          appSetting.value = targetSlotAppSettings[foundTargetIndex].value;
          result.push(appSetting as IAppSetting);
        }
      }
    }
    return result;
  }

  public applyAppSetting(appSettings: IAppSetting[]): IAppSetting[] {
    const result: IAppSetting[] = [];
    for (const appSetting of appSettings) {
      const foundIndex = findAppSettingName(appSetting.name, this.swapAppService.appSettings);
      if (foundIndex >= 0) {
        result.push({
          ...appSetting,
          slotSetting: this.swapAppService.appSettings[foundIndex].slotSetting,
        });
      } else {
        core.warning(`Cannot apply setting name "${appSetting.name}" in ${this.swapAppService.name}`);
      }
    }
    return result;
  }
}
