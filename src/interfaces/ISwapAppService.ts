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
  /**
   * value - app setting value
   */
  value?: string;
}

export interface IAppSetting {
  name: string;
  slotSetting: boolean;
  value: string;
}

/**
 * Connection String Type:
 * accepted values in https://docs.microsoft.com/en-us/cli/azure/webapp/config/connection-string?view=azure-cli-latest#az-webapp-config-connection-string-set
 */
type connectionStringType =
  | 'ApiHub'
  | 'Custom'
  | 'DocDb'
  | 'EventHub'
  | 'MySql'
  | 'NotificationHub'
  | 'PostgreSQL'
  | 'RedisCache'
  | 'SQLAzure'
  | 'SQLServer'
  | 'ServiceBus';

export interface IConnectionString extends IAppSetting {
  type: connectionStringType;
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
