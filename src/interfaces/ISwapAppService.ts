import { ISwapAppSetting } from './ISwapAppSetting';

export type SlotType = 'source' | 'target';

export enum DefaultSensitiveEnum {
  true = 'true',
  false = 'false',
  required = 'required',
}

export enum DefaultSlotSettingEnum {
  true = 'true',
  false = 'false',
  required = 'required',
  inherit = 'inherit',
}

export interface ISwapAppService {
  name: string;
  resourceGroup: string;
  slot: string;
  targetSlot: string;
  defaultSlotSetting: DefaultSlotSettingEnum;
  defaultSensitive: DefaultSensitiveEnum;
  appSettings: ISwapAppSetting[];
  connectionStrings: ISwapAppSetting[];
}
