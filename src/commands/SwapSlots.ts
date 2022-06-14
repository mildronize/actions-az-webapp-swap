import * as core from '@actions/core';
import { ICommand } from '../interfaces/ICommand';

export class SwapSlots implements ICommand {
  constructor() {}

  public async execute() {
    core.debug(`Using swap-slots mode`);
  }
}
