import * as core from '@actions/core';
import { ISwapAppService } from './interfaces';

import { GetDeploySlots } from './commands/GetDeploySlots';
import { SetDeploySlots } from './commands/SetDeploySlots';
import { SwapSlots } from './commands/SwapSlots';
import { isEmptyString } from './utils/commonUtility';
import { Clean } from './commands/Clean';

export type Mode = 'get-deploy-slots' | 'set-deploy-slots' | 'swap-slots' | 'clean';

function safeParseJson(json: string) {
  if (isEmptyString(json)) return undefined;
  try {
    return JSON.parse(json);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

async function main() {
  const input = {
    mode: core.getInput('mode', { required: true }) as Mode,
    // get-deploy-slots
    swapAppServiceList: core.getMultilineInput('config').join(''),
    repo: core.getInput('repo'),
    token: core.getInput('token'),
    ref: core.getInput('ref'),
    path: core.getInput('path'),
    // set-deploy-slots
    swapAppService: core.getMultilineInput('swap-config').join(''),
  };
  if (input.mode === 'get-deploy-slots') {
    const swapAppService = safeParseJson(input.swapAppServiceList) as ISwapAppService[];
    if (!swapAppService) throw new Error(`Invalid JSON setting on get-deploy-slots mode`);
    if (!input.repo) throw new Error(`repo input is required on get-deploy-slots mode`);
    if (!input.token) throw new Error(`token input is required on get-deploy-slots mode`);
    if (!input.ref) throw new Error(`ref input is required on get-deploy-slots mode`);
    if (!input.path) throw new Error(`path input is required on get-deploy-slots mode`);
    const { repo, token, ref, path } = input;
    return await new GetDeploySlots().execute(swapAppService, {
      repo,
      token,
      ref,
      path,
    });
  }
  if (input.mode === 'set-deploy-slots') {
    const swapAppService = safeParseJson(input.swapAppService) as ISwapAppService;
    if (!swapAppService) throw new Error(`Invalid Swap App setting on set-deploy-slots mode`);
    return await new SetDeploySlots(swapAppService).execute();
  }
  if (input.mode === 'swap-slots') {
    const swapAppService = safeParseJson(input.swapAppService) as ISwapAppService;
    if (!swapAppService) throw new Error(`Invalid Swap App setting on swap-slots mode`);
    return await new SwapSlots(swapAppService).execute();
  }
  if (input.mode === 'clean') {
    if (!input.repo) throw new Error(`repo input is required on clean mode`);
    if (!input.token) throw new Error(`token input is required on clean mode`);
    if (!input.ref) throw new Error(`ref input is required on clean mode`);
    const { repo, token, ref } = input;
    return await new Clean({
      repo,
      token,
      ref,
    }).execute();
  }
  throw new Error(`"${input.mode} is not available"`);
}

main();
