import * as core from '@actions/core';
import { ICommand } from '../interfaces/ICommand';

export class SetDeploySlots implements ICommand {
  constructor() {}

  public async execute() {
    core.debug(`Using set-deploy-slots mode`);
  }
}
