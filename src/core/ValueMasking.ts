import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';

export class ValueMasking {
  constructor(
    private swapAppService: Pick<ISwapAppService, 'appSettings' | 'defaultSensitive' | 'defaultSlotSetting'>,
    private appSettings: IAppSetting[]
  ) {}

  public mask() {
    return this.appSettings;
  }
}
