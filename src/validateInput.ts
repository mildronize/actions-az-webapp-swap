import { ISwapAppService, AppSettingProperty, ISwapAppSetting, IAppSetting } from './interfaces/ISwapAppService';
import { z } from 'zod';
import { exit } from 'process';

const AppSettingSchema = z.object({
  name: z.string(),
  sensitive: z.boolean().optional(),
  slotSetting: z.boolean().optional(),
});

// creating a schema for strings
const SwapAppServiceSchema = z.array(
  z.object({
    name: z.string(),
    resourceGroup: z.string(),
    slot: z.string(),
    targetSlot: z.string(),
    defaultSlotSetting: z.nativeEnum(AppSettingProperty),
    defaultSensitive: z.nativeEnum(AppSettingProperty),
    appSettings: z.array(AppSettingSchema),
  })
);

export function validateInput(input: ISwapAppService[]) {
  const result = SwapAppServiceSchema.safeParse(input);
  if (!result.success) {
    const formatted = result.error.format();
    // TODO: Make Human readable error message
    console.error(JSON.stringify(formatted, null, 2));
    exit(1);
  }
}

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

export class SwapAppSettings {
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
