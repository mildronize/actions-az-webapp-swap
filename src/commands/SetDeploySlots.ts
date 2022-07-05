import * as core from '@actions/core';
import { ISwapAppService } from '../interfaces';
import AppSettings from '../core/AppSettings';

export class SetDeploySlots {
  constructor(private swapAppService: ISwapAppService) {}

  public async execute() {
    core.debug(`Using set-deploy-slots mode`);
    core.info('Getting App Setting from Azure ');
    const appSetting = new AppSettings(this.swapAppService);
    (await appSetting.list()).fullfill().apply();
    core.info('Setting App Setting to Azure');
    await Promise.all([appSetting.set('source'), appSetting.set('target')]);
  }
}
