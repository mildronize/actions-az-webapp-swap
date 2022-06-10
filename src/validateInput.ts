import { ISwapAppService, AppSettingProperty, ISwapAppSetting, IAppSetting } from './interfaces/ISwapAppService';
import { z } from 'zod';
import { exit } from 'process';

// creating a schema for strings
const SwapAppServiceSchema = z.array(
  z.object({
    name: z.string(),
    resourceGroup: z.string(),
    slot: z.string(),
    targetSlot: z.string(),
    defaultSlotSetting: z.nativeEnum(AppSettingProperty),
    defaultSensitive: z.nativeEnum(AppSettingProperty),
    appSettings: z.array(
      z.object({
        name: z.string(),
        sensitive: z.boolean(),
        slotSetting: z.boolean(),
      })
    ),
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
  error: any;
}

export function validateAppSettings(
  swapAppService: Pick<ISwapAppService, 'appSettings' | 'defaultSensitive' | 'defaultSlotSetting'>,
  appSettings: IAppSetting[]
): IValidateAppSettingsReturnType {
  return {
    success: true,
    error: '',
  }
}
