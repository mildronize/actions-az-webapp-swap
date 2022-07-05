import { ISwapAppService, DefaultSensitiveEnum, DefaultSlotSettingEnum } from '../interfaces/ISwapAppService';
import { z } from 'zod';

const AppSettingSchema = z.object({
  name: z.string(),
  // TODO: Make it optional later
  sensitive: z.boolean(),
  // TODO: Make it optional later
  slotSetting: z.boolean(),
});

const SwapAppServiceSchema = z.object({
  name: z.string(),
  resourceGroup: z.string(),
  slot: z.string(),
  targetSlot: z.string(),
  defaultSlotSetting: z.nativeEnum(DefaultSlotSettingEnum),
  defaultSensitive: z.nativeEnum(DefaultSensitiveEnum),
  appSettings: z.array(AppSettingSchema).optional(),
  connectionStrings: z.array(AppSettingSchema).optional(),
});

export default class InputValidation {
  public static validateArray(swapAppServiceList: Partial<ISwapAppService>[]): ISwapAppService[] {
    for (let swapAppService of swapAppServiceList) {
      swapAppService = InputValidation.validate(swapAppService);
    }
    return swapAppServiceList as ISwapAppService[];
  }

  public static validate(swapAppService: Partial<ISwapAppService>): ISwapAppService {
    const result = SwapAppServiceSchema.safeParse(swapAppService);
    if (!result.success) {
      const formatted = result.error.format();
      // TODO: Make Human readable error message
      console.error(JSON.stringify(formatted, null, 2));
      throw new Error(`Input Validation Error at ${swapAppService.name}`);
    }

    if (!swapAppService.appSettings) swapAppService.appSettings = [];
    if (!swapAppService.connectionStrings) swapAppService.connectionStrings = [];
    return swapAppService as ISwapAppService;
  }
}
