import {
  ISwapAppService,
  IAppSetting,
  DefaultSlotSettingEnum,
  DefaultSensitiveEnum,
} from '../interfaces/ISwapAppService';
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
      core.warning(`Cannot fulfill swap app service from giving app setting because all slotSettings is required`);
    if (this.swapAppService.defaultSensitive === DefaultSensitiveEnum.required)
      core.warning(`Cannot fulfill swap app service from giving app setting because all sensitive is required`);

    for (const appSetting of appSettings) {
      const found = findAppSettingName(appSetting.name, this.swapAppService.appSettings);
      if (found < 0) {
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
        /// Start Fullfill
        this.swapAppService.appSettings.push({
          name: appSetting.name,
          sensitive,
          slotSetting,
          // It will use for merging between 2 app settings
          baseSlotSetting: appSetting.slotSetting,
        });
      } else {
        // If existing it will merge between 2 app settings
        const tmpAppSetting = this.swapAppService.appSettings[found];
        if (tmpAppSetting.baseSlotSetting !== undefined) {
          tmpAppSetting.baseSlotSetting = tmpAppSetting.baseSlotSetting || appSetting.slotSetting;
          tmpAppSetting.slotSetting = tmpAppSetting.slotSetting || appSetting.slotSetting;
        } else {
          tmpAppSetting.baseSlotSetting = appSetting.slotSetting;
        }
      }
    }

    for (const appSetting of this.swapAppService.appSettings) {
      if (appSetting.slots) appSetting.slots.push(slot);
      else appSetting.slots = [slot];
    }
    return this.swapAppService;
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
    // for (const sourceAppSetting of sourceSlotAppSettings) {
    //   const foundSwapAppSettingIndex = findAppSettingName(sourceAppSetting.name, this.swapAppService.appSettings);
    //   if (foundSwapAppSettingIndex < 0)
    //     throw new Error(`App Setting Name of Source Slot (${sourceAppSetting.name}) is not found in SwapAppSetting`);
    //   const swapAppSettings = this.swapAppService.appSettings[foundSwapAppSettingIndex];
    //   let appSetting: Record<string, any> = { name: sourceAppSetting.name, slotSetting: swapAppSettings.slotSetting };
    //   if (swapAppSettings.slotSetting === true) {
    //     appSetting.value = sourceAppSetting.value;
    //     result.push(appSetting as IAppSetting);
    //   } else {
    //     const foundTargetIndex = findAppSettingName(sourceAppSetting.name, targetSlotAppSettings);
    //     if (foundTargetIndex >= 0) {
    //       appSetting.value = targetSlotAppSettings[foundTargetIndex].value;
    //       result.push(appSetting as IAppSetting);
    //     }
    //   }
    // }
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
}
