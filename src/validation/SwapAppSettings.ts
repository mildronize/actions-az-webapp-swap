import { ISwapAppService, DefaultSensitiveEnum, DefaultSlotSettingEnum, IAppSetting } from '../interfaces';
import * as core from '@actions/core';

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

export default class SwapAppSettingsValidation {
  private appSettingKeys: string[] = [];
  constructor(
    private swapAppService: Pick<ISwapAppService, 'appSettings' | 'defaultSensitive' | 'defaultSlotSetting'>,
    private appSettings: IAppSetting[]
  ) {}

  public validate(slot?: string) {
    core.debug(`Validating SwapAppService config with slot: ${slot}`);
    const result = this.safeValidate();
    if (!result.success) throw new Error(`Invalid SwapAppService config with slot (${slot}): ${result.error}`);
  }

  public safeValidate() {
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
    if (this.swapAppService.defaultSlotSetting === DefaultSlotSettingEnum.required) {
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
    if (this.swapAppService.defaultSensitive === DefaultSensitiveEnum.required) {
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
