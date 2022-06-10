export enum AppSettingProperty {
  true = 'true',
  false = 'false',
  required = 'required',
  default = 'default',
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
  defaultSlotSetting: AppSettingProperty;
  defaultSensitive: AppSettingProperty;
  appSettings: ISwapAppSetting[];
}
