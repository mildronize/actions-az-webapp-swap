import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import fs from 'fs';
import path from 'path';
import { createBranchWhenNotExist, createPullRequest, gitCommit, gitCommitNewBranch } from '../utils/githubUtility';
import { constants } from '../constants';
import { executeProcess } from '../utils/executeProcess';
import { PathUtility } from '../utils/PathUtility';
const { WorkingDirectory, DefaultEncoding, gitConfig } = constants;

interface ICreateSwapPlanOption {
  repo: string;
  ref: string;
  token: string;
  path: string;
}

export class CreateSwapPlan {
  constructor(private options: ICreateSwapPlanOption) {}

  public async execute() {
    core.debug(`Using create-swap-plan mode`);
    const { repo, path: targetPath, ref, token: personalAccessToken } = this.options;
    const artifactClient = artifact.create();
    const downloadResponse = await artifactClient.downloadAllArtifacts();

    const sharedGitConfig = {
      repo,
      ref,
      personalAccessToken,
      name: gitConfig.name,
      email: gitConfig.email,
    };

    await createBranchWhenNotExist(sharedGitConfig);

    /**
     * Step 2: Commit Marked App Setting (Source Slot)
     */
    const pathUtility = new PathUtility(WorkingDirectory.root);

    await executeProcess('tree', { slient: false });

    // output result
    for (let response of downloadResponse) {
      console.log(response.artifactName);
      console.log(response.downloadPath);
      await executeProcess(
        `cp -rf ${path.join(response.downloadPath, WorkingDirectory.root, WorkingDirectory.beforeSwap)} ${
          WorkingDirectory.root
        }`
      );
    }

    await gitCommit({
      ...sharedGitConfig,
      targetPath,
      rootPath: WorkingDirectory.root,
      message: 'Get App Setting',
    });
    pathUtility.clean();

    /**
     * Step 3: Simulate if values are swapped (Target Slot)
     */

    for (let response of downloadResponse) {
      console.log(response.artifactName);
      console.log(response.downloadPath);
      await executeProcess(
        `cp -rf ${path.join(response.downloadPath, WorkingDirectory.root, WorkingDirectory.afterSwap)} ${
          WorkingDirectory.root
        }`
      );
    }

    // Create tmp file if no change it will be merge
    fs.writeFileSync(
      path.resolve(WorkingDirectory.root, `timestamp-${new Date().getTime()}`),
      'Force Diff for Preview Change',
      DefaultEncoding
    );

    const newBranch = await gitCommitNewBranch({
      ...sharedGitConfig,
      targetPath,
      rootPath: WorkingDirectory.root,
      message: 'Get App Setting if app service is swapped',
    });

    await createPullRequest({
      ...sharedGitConfig,
      sourceBranch: newBranch,
    });
  }
}
