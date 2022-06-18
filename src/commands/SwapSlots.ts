import * as core from '@actions/core';
import { ISwapAppService } from '../interfaces/ISwapAppService';
import { webAppSwap } from '../utils/azureUtility';

export class SwapSlots {
  constructor(private swapAppService: ISwapAppService) {}

  public async execute() {
    core.debug(`Using swap-slots mode`);
    const { name, resourceGroup, slot, targetSlot } = this.swapAppService;
    await webAppSwap(name, resourceGroup, slot, targetSlot);
  }
}
