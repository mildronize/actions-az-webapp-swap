import * as core from '@actions/core';
import { ISwapAppService } from './interfaces/ISwapAppService';

import { GetDeploySlots } from './commands/GetDeploySlots';
import { SetDeploySlots } from './commands/SetDeploySlots';
import { SwapSlots } from './commands/SwapSlots';
import { isEmptyString } from './utils/commonUtility';

export type Mode = 'get-deploy-slots' | 'set-deploy-slots' | 'swap-slots';

function safeParseJsonConfig(json: string): ISwapAppService[] | undefined {
  if (!isEmptyString(json)) return undefined;
  try {
    return JSON.parse(json) as ISwapAppService[];
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

async function main() {
  const input = {
    mode: core.getInput('mode', { required: true }) as Mode,
    swapAppServiceConfig: safeParseJsonConfig(core.getInput('config')),
  };
  if (input.mode === 'get-deploy-slots') {
    if (!input.swapAppServiceConfig) throw new Error(`Invalid JSON setting on get-deploy-slots mode`);
    return await new GetDeploySlots().execute(input.swapAppServiceConfig);
  }
  if (input.mode === 'set-deploy-slots') return await new SetDeploySlots().execute();
  if (input.mode === 'swap-slots') return await new SwapSlots().execute();
  throw new Error(`"${input.mode} is not available"`);
}

main();
