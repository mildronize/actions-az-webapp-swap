import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';

export default class SwapAppSettingsSync {
  constructor(
    private swapAppService: ISwapAppService,
    private appSettings: IAppSetting[]
  ) {}


  public run(){
    return this.swapAppService;
  }
}
