import * as core from '@actions/core';

export class SetDeploySlots {
  constructor() {}

  public async execute() {
    core.debug(`Using set-deploy-slots mode`);
  }
}
