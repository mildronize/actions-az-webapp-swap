import {
  ISwapAppService,
  DefaultSensitiveEnum,
  DefaultSlotSettingEnum,
  ISwapAppSetting,
  IAppSetting,
} from '../interfaces/ISwapAppService';
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
  appSettings: z.array(AppSettingSchema),
});

// creating a schema for strings
const SwapAppServiceArraySchema = z.array(SwapAppServiceSchema);

export default class InputValidation {
  public static validateArray(input: ISwapAppService[]) {
    const result = SwapAppServiceArraySchema.safeParse(input);
    if (!result.success) {
      const formatted = result.error.format();
      // TODO: Make Human readable error message
      console.error(JSON.stringify(formatted, null, 2));
      throw new Error('Input Validation Error');
    }
  }

  public static validate(input: ISwapAppService) {
    const result = SwapAppServiceSchema.safeParse(input);
    if (!result.success) {
      const formatted = result.error.format();
      // TODO: Make Human readable error message
      console.error(JSON.stringify(formatted, null, 2));
      throw new Error('Input Validation Error');
    }
  }
}
