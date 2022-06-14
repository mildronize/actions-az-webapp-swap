import * as core from '@actions/core';
import { ISwapAppService } from './interfaces/ISwapAppService';

import { GetDeploySlots } from './commands/GetDeploySlots';
import { SetDeploySlots } from './commands/SetDeploySlots';
import { SwapSlots } from './commands/SwapSlots';

export type Mode = 'get-deploy-slots' | 'set-deploy-slots' | 'swap-slots';

async function main() {
  const input = {
    mode: core.getInput('mode') as Mode,
    swapAppServiceConfig: JSON.parse(core.getInput('config')) as ISwapAppService[],
  };
  if (input.mode === 'get-deploy-slots') return await new GetDeploySlots().execute(input.swapAppServiceConfig);
  if (input.mode === 'set-deploy-slots') return await new SetDeploySlots().execute();
  if (input.mode === 'swap-slots') return await new SwapSlots().execute();
  throw new Error(`"${input.mode} is not available"`);
}

main();
