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

export interface ISwapAppSetting {
  /**
   * name -- Use in input
   */
  name: string;
  /**
   * sensitive -- Use in input
   */
  sensitive: boolean;
  /**
   * slotSetting -- Use in input
   */
  slotSetting: boolean;
  /**
   * baseSlotSetting - Previous slot setting value before merge
   */
  baseSlotSetting?: boolean;
  /**
   * slots -- Slot location where the app setting will be appiled
   */
  slots?: string[];
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
