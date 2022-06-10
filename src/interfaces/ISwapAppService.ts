export type AppSettingProperty = 'true' | 'false' | 'required';

export interface IAppSetting {
  name: string;
  sensitive: boolean;
  slotSetting: boolean;
}

export interface ISwapAppService {
  name: string;
  resourceGroup: string;
  slot: string;
  targetSlot: string;
  defaultSlotSetting: AppSettingProperty;
  defaultSensitive: AppSettingProperty;
  appSettings: IAppSetting[];
}
