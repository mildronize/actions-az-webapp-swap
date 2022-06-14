import * as core from '@actions/core';

import { GetDeploySlots } from '../commands/GetDeploySlots';
import { SetDeploySlots } from '../commands/SetDeploySlots';
import { SwapSlots } from '../commands/SwapSlots';

export type Mode = 'get-deploy-slots' | 'set-deploy-slots' | 'swap-slots';

export class ModeFactory {
  public static async getMode(mode: Mode){
    core.debug('Start');
    if(mode === 'get-deploy-slots')
        return await new GetDeploySlots().execute();
    if(mode === 'set-deploy-slots')
        return await new SetDeploySlots().execute();
    if(mode === 'swap-slots')
        return await new SwapSlots().execute();
    throw new Error(`"${mode} is not available"`);
  }
}
