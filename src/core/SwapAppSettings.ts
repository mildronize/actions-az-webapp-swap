import {
  ISwapAppService,
  IAppSetting,
  DefaultSlotSettingEnum,
  DefaultSensitiveEnum,
} from '../interfaces/ISwapAppService';
import { FallbackValue } from '../constants';
export default class SwapAppSettings {
  constructor(private swapAppService: ISwapAppService) {}

  private isAppSettingExisting(name: string) {
    let index = 0;
    for (const appSetting of this.swapAppService.appSettings) {
      if (appSetting.name === name) return index++;
    }
    return -1;
  }
  /**
   * Expected result
   * Using `defaultSlotSetting` and `defaultSensitive` to generate fullfill JSON for non-required field
   */
  public fullfill(appSettings: IAppSetting[], slot: string) {
    if (this.swapAppService.defaultSlotSetting === DefaultSlotSettingEnum.required)
      throw new Error(`Cannot fulfill swap app service from giving app setting because all slotSettings is required`);
    if (this.swapAppService.defaultSensitive === DefaultSensitiveEnum.required)
      throw new Error(`Cannot fulfill swap app service from giving app setting because all sensitive is required`);

    for (const appSetting of appSettings) {
      const found = this.isAppSettingExisting(appSetting.name);
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
        if (tmpAppSetting.baseSlotSetting) {
          tmpAppSetting.baseSlotSetting = tmpAppSetting.baseSlotSetting || appSetting.slotSetting;
        } else {
          tmpAppSetting.baseSlotSetting = appSetting.slotSetting;
        }
        tmpAppSetting.slotSetting = tmpAppSetting.baseSlotSetting || appSetting.slotSetting;
      }
    }

    for (const appSetting of this.swapAppService.appSettings) {
      if (appSetting.slots) appSetting.slots.push(slot);
      else appSetting.slots = [slot];
      // if (appSetting.baseSlotSetting) appSetting.baseSlotSetting = appSetting.baseSlotSetting || this.swapAppService.appSettings
    }
    console.log(this.swapAppService.appSettings);
    return this.swapAppService;
  }
}
