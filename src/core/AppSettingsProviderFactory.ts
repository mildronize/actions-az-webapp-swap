import { ISwapAppService } from '../interfaces';
import AppSettings from './AppSettings';
import AppSettingsBase, { AppSettingsType } from './AppSettingsBase';
import ConnectionStrings from './ConnectionStrings';

export class AppSettingsProviderFactory {
  public static getAppSettingsProvider(type: AppSettingsType, swapAppService: ISwapAppService): AppSettingsBase {
    if (type === AppSettingsType.AppSettings) {
      return new AppSettings(swapAppService);
    }
    if (type === AppSettingsType.ConnectionStrings) {
      return new ConnectionStrings(swapAppService);
    }
    throw new Error(`Invalid AppSetting type.`);
  }
}
