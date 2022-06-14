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

// creating a schema for strings
const SwapAppServiceSchema = z.array(
  z.object({
    name: z.string(),
    resourceGroup: z.string(),
    slot: z.string(),
    targetSlot: z.string(),
    defaultSlotSetting: z.nativeEnum(DefaultSlotSettingEnum),
    defaultSensitive: z.nativeEnum(DefaultSensitiveEnum),
    appSettings: z.array(AppSettingSchema),
  })
);

export default class InputValidation {
  constructor(private input: ISwapAppService[]) {}

  public validate() {
    const result = SwapAppServiceSchema.safeParse(this.input);
    if (!result.success) {
      const formatted = result.error.format();
      // TODO: Make Human readable error message
      console.error(JSON.stringify(formatted, null, 2));
      throw new Error('Input Validation Error');
    }
  }
}
