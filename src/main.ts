import * as core from '@actions/core';
import {
  DefaultSensitiveEnum,
  DefaultSlotSettingEnum,
  ISwapAppService,
  ISwapAppSetting,
} from './interfaces/ISwapAppService';

import { GetDeploySlots } from './commands/GetDeploySlots';
import { SetDeploySlots } from './commands/SetDeploySlots';
import { SwapSlots } from './commands/SwapSlots';
import { isEmptyString } from './utils/commonUtility';

export type Mode = 'get-deploy-slots' | 'set-deploy-slots' | 'swap-slots';

function safeParseJsonSwapAppSetting(json: string): ISwapAppSetting[] | undefined {
  if (isEmptyString(json)) return undefined;
  try {
    return JSON.parse(json) as ISwapAppSetting[];
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

function safeParseJsonConfig(json: string): ISwapAppService[] | undefined {
  if (isEmptyString(json)) return undefined;
  try {
    return JSON.parse(json) as ISwapAppService[];
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

async function main() {
  const input = {
    mode: core.getInput('mode', { required: true }) as Mode,
    // get-deploy-slots
    swapAppServiceConfig: core.getMultilineInput('config').join(''),
    repo: core.getInput('repo'),
    token: core.getInput('token'),
    ref: core.getInput('ref'),
    path: core.getInput('path'),
    // set-deploy-slots
    name: core.getInput('name'),
    resourceGroup: core.getInput('resource-group'),
    slot: core.getInput('slot'),
    targetSlot: core.getInput('target-slot'),
    defaultSlotSetting: core.getInput('default-slot-setting'),
    defaultSensitive: core.getInput('default-sensitive'),
    appSettings: core.getMultilineInput('app-settings-config').join(''),
  };
  if (input.mode === 'get-deploy-slots') {
    const swapAppService = safeParseJsonConfig(input.swapAppServiceConfig);
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
    const appSettings = safeParseJsonSwapAppSetting(input.appSettings);
    if (!appSettings) throw new Error(`Invalid Swap App setting on set-deploy-slots mode`);
    if (!input.name) throw new Error(`name input is required on set-deploy-slots mode`);
    if (!input.resourceGroup) throw new Error(`resourceGroup input is required on set-deploy-slots mode`);
    if (!input.slot) throw new Error(`slot input is required on set-deploy-slots mode`);
    if (!input.targetSlot) throw new Error(`targetSlot input is required on set-deploy-slots mode`);
    if (!input.defaultSlotSetting) throw new Error(`defaultSlotSetting input is required on set-deploy-slots mode`);
    if (!input.defaultSensitive) throw new Error(`defaultSensitive input is required on set-deploy-slots mode`);
    const { name, resourceGroup, slot, targetSlot, defaultSlotSetting, defaultSensitive } = input;
    return await new SetDeploySlots({
      name,
      resourceGroup,
      slot,
      targetSlot,
      defaultSlotSetting: defaultSlotSetting as DefaultSlotSettingEnum,
      defaultSensitive: defaultSensitive as DefaultSensitiveEnum,
      appSettings,
    }).execute();
  }
  if (input.mode === 'swap-slots') return await new SwapSlots().execute();
  throw new Error(`"${input.mode} is not available"`);
}

main();
