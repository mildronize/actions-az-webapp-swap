import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';
import crypto from 'crypto';

export function hashValue(value: string) {
  const sha256Hasher = crypto.createHmac('sha3-512', process.env.HASH_SECRET || '');
  return sha256Hasher.update(value).digest('base64');
}

export default class AppSettingsMasking {
  constructor(
    private swapAppService: Pick<ISwapAppService, 'appSettings' | 'defaultSensitive' >,
    private appSettings: IAppSetting[]
  ) {}

  public mask() {
    const { appSettings: swapAppSettings, defaultSensitive} = this.swapAppService;
    // for(const swapAppSetting of swapAppSettings ){


    //   this.appSettings = 
    //     this.appSettings.map( 
    //       appSetting => appSetting.name === swapAppSetting.name 
    //       && 
    //       ?

    //      )
    // }
    return this.appSettings;
  }
}
