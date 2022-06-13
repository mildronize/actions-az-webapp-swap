import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';

export default class SwapAppSettings {
  constructor(private swapAppService: ISwapAppService) {}

  /**
   * Expected result
   * Using `defaultSlotSetting` and `defaultSensitive` to generate fullfill JSON for non-required field
   */
  public fullfill(appSettings: IAppSetting[], slot: string) {
    for(const appSetting of this.swapAppService.appSettings){
      if(appSetting.slots){
        appSetting.slots.push(slot);
      } else {
        appSetting.slots = [ slot ];
      }
    }
    return this.swapAppService;
  }
}
