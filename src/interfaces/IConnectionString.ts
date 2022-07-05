import { IAppSetting } from './IAppSetting';

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
