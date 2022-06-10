import { ISwapAppService, AppSettingProperty, ISwapAppSetting, IAppSetting } from '../interfaces/ISwapAppService';

export interface IValidateAppSettingsReturnType {
  success: boolean;
  error?: any;
}

export function validateUniqueAppSettingsName(appSettings: Pick<IAppSetting, 'name'>[]) {
  const uniqueName = new Set();
  for (const appSetting of appSettings) {
    if (uniqueName.has(appSetting.name)) {
      throw Error(`App Setting "${appSetting.name}" is duplicated`);
    }
    uniqueName.add(appSetting.name);
  }
}

export default class SwapAppSettings {
  private appSettingKeys: string[] = [];
  constructor(
    private swapAppService: Pick<ISwapAppService, 'appSettings' | 'defaultSensitive' | 'defaultSlotSetting'>,
    private appSettings: IAppSetting[]
  ) {}

  public validate() {
    validateUniqueAppSettingsName(this.appSettings);
    validateUniqueAppSettingsName(this.swapAppService.appSettings);

    for (const appSetting of this.appSettings) {
      this.appSettingKeys.push(appSetting.name);
    }

    let result = this.validateSlotSettings();
    if (!result?.success) return result;
    result = this.validateSensitive();
    if (!result?.success) return result;

    return {
      success: true,
    };
  }

  private validateSlotSettings() {
    if (this.swapAppService.defaultSlotSetting === AppSettingProperty.required) {
      let count = 0;
      for (const appSetting of this.swapAppService.appSettings) {
        if (this.appSettingKeys.indexOf(appSetting.name) != -1 && appSetting.slotSetting !== undefined) count++;
      }
      if (count !== this.appSettings.length) {
        return {
          success: false,
          error: 'All slotSettings is required',
        };
      }
    }
    return {
      success: true,
    };
  }

  private validateSensitive() {
    if (this.swapAppService.defaultSensitive === AppSettingProperty.required) {
      let count = 0;
      for (const appSetting of this.swapAppService.appSettings) {
        if (this.appSettingKeys.indexOf(appSetting.name) != -1 && appSetting.sensitive !== undefined) count++;
      }
      if (count !== this.appSettings.length) {
        return {
          success: false,
          error: 'All sensitve is required',
        };
      }
    }
    return {
      success: true,
    };
  }
}
