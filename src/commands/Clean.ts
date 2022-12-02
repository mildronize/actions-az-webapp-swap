import * as core from '@actions/core';
import { renameRemoteBranch } from '../utils/githubUtility';

interface ICleanOptions {
  repo: string;
  ref: string;
  token: string;
}

export class Clean {
  constructor(private options: ICleanOptions) {}

  public async execute() {
    core.debug(`Using swap-slots mode`);
    const { repo, ref, token: personalAccessToken } = this.options;
    await renameRemoteBranch({
      repo,
      ref,
      personalAccessToken,
      name: 'GitHub Action Swap Bot',
      email: 'github-swap-bot@github.com',
    });
  }
}
