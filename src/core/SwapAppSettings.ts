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
    const found = this.swapAppService.appSettings.filter(appSetting => appSetting.name === name);
    if (found.length >= 1) return true;
    return false;
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
      if (!this.isAppSettingExisting(appSetting.name)) {
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
        });
      }
    }

    for (const appSetting of this.swapAppService.appSettings) {
      if (appSetting.slots) appSetting.slots.push(slot);
      else appSetting.slots = [slot];
    }
    console.log(this.swapAppService.appSettings);
    return this.swapAppService;
  }
}
