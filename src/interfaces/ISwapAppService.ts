export enum DefaultSensitiveEnum {
  true = 'true',
  false = 'false',
  required = 'required'
}

export enum DefaultSlotSettingEnum {
  true = 'true',
  false = 'false',
  required = 'required',
  inherit = 'inherit'
}

export interface ISwapAppSetting {
  name: string;
  sensitive?: boolean;
  slotSetting?: boolean;
}

export interface IAppSetting {
  name: string;
  slotSetting: boolean;
  value: string;
}

export interface ISwapAppService {
  name: string;
  resourceGroup: string;
  slot: string;
  targetSlot: string;
  defaultSlotSetting: DefaultSlotSettingEnum;
  defaultSensitive: DefaultSensitiveEnum;
  appSettings: ISwapAppSetting[];
}
