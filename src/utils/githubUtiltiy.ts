import { executeBatchProcess, executeProcess, parseBufferToString } from './executeProcess';
import { format } from 'date-fns';
import * as core from '@actions/core';
import { stripIndent } from 'common-tags';
import path from 'path';

export const git = {
  add: (path: string) => `git add ${path}`,
  addAll: () => `git add -A`,
  clone: (repo: string, personalAccessToken: string, outputPath: string) =>
    `git clone https://${personalAccessToken}@github.com/${repo}.git ${outputPath}`,
  configUser: (email: string, name: string) => stripIndent`
    git config --global user.email "${email}" && git config --global user.name "${name}"
    `,
  // https://stackoverflow.com/a/40255467
  commit: (message: string) => `(git diff --quiet && git diff --staged --quiet) || git commit -am "${message}"`,
  push: (ref: string) => `git push origin ${ref}`,
  pushUpstream: (ref: string) => `git push --set-upstream origin ${ref} --force`,
  checkoutRef: (ref: string) => `git checkout -f ${ref}`,
  checkoutNewBranch: (ref: string) => `git checkout -b ${ref}`,
  // https://stackoverflow.com/questions/34100048/create-empty-branch-on-github
  createEmptyBranch: (ref: string, message: string) =>
    `git switch --orphan ${ref} && git commit --allow-empty -m "${message}"`,
  // showRef: (ref: string) => `git show-ref ${ref}`,
  lsRemote: (ref: string) => `git ls-remote --heads origin ${ref}`,
  renameBranch: (oldRef: string, newRef: string) => `git branch -m ${oldRef} ${newRef}`,
  removeRemoteBranch: (ref: string) => `git push origin --delete ${ref}`,
};

interface IGitOptions {
  repo: string;
  personalAccessToken: string;
  ref: string;
  email: string;
  name: string;
  message: string;
  rootPath: string;
  targetPath: string;
}

export async function gitCommit({
  targetPath,
  rootPath,
  repo,
  personalAccessToken,
  ref,
  name,
  email,
  message,
}: IGitOptions): Promise<void> {
  const tmpDir = `tmp-${new Date().getTime()}`;
  await executeBatchProcess([
    git.clone(repo, personalAccessToken, tmpDir),
    `cd ${tmpDir}`,
    git.checkoutRef(ref),
    `cd ..`,
    `cp -r ${path.resolve(rootPath)} ${path.join(tmpDir, targetPath)}`,
    `cd ${tmpDir}`,
    git.configUser(email, name),
    git.addAll(),
    git.commit(message),
    git.push(ref),
    `rm -rf ${tmpDir}`,
  ]);
}

export async function gitCommitNewBranch({
  targetPath,
  rootPath,
  repo,
  personalAccessToken,
  ref,
  name,
  email,
  message,
}: IGitOptions): Promise<void> {
  const tmpDir = `tmp-${new Date().getTime()}`;
  // const newBranch = `${ref}-swap-${format(new Date(), 'yyyyMMdd')}T${format(new Date(), 'kkmmssX')}Z`;
  const newBranch = `${ref}-swap-${new Date().getTime()}`;
  await executeBatchProcess([
    git.clone(repo, personalAccessToken, tmpDir),
    `cd ${tmpDir}`,
    git.checkoutRef(ref),
    git.checkoutNewBranch(newBranch),
    `cd ..`,
    `cp -r ${path.resolve(rootPath)} ${path.join(tmpDir, targetPath)}`,
    `cd ${tmpDir}`,
    git.configUser(email, name),
    git.addAll(),
    git.commit(message),
    git.pushUpstream(newBranch),
    `rm -rf ${tmpDir}`,
  ]);
}

export async function createBranchWhenNotExist({
  repo,
  personalAccessToken,
  ref,
  name,
  email,
}: Omit<IGitOptions, 'targetPath' | 'rootPath' | 'message'>) {
  const tmpDir = `tmp-${new Date().getTime()}`;
  await executeProcess(git.clone(repo, personalAccessToken, tmpDir));
  if ((await isBranchExist(ref, tmpDir)) === false) {
    await executeBatchProcess([
      `cd ${tmpDir}`,
      git.configUser(email, name),
      git.checkoutNewBranch(ref),
      git.pushUpstream(ref),
      `rm -rf ${tmpDir}`,
    ]);
  } else console.log(`The branch "${ref} is exist"`);
}

async function isBranchExist(branch: string, repoPath: string): Promise<boolean> {
  const result = await executeBatchProcess([`cd ${repoPath}`, git.lsRemote(branch)]);
  const stdout = parseBufferToString(result.stdout).trim();
  if (stdout === '') return false;
  return true;
}

async function createPullRequest(base: string, head: string) {
  const name = `Preview App Setting After Swap ${format(new Date(), 'yyyy MM, dd - kk:mm:ss OOOO')}`;

  // TODO: Close PR with Tags
  // 1. Create PR
  // 2. Create tags
}

export async function renameRemoteBranch({
  repo,
  personalAccessToken,
  ref,
  name,
  email,
}: Omit<IGitOptions, 'targetPath' | 'rootPath' | 'message'>) {
  const tmpDir = `tmp-${new Date().getTime()}`;
  const newBranch = `${ref}-done-${new Date().getTime()}`;
  await executeProcess(git.clone(repo, personalAccessToken, tmpDir));
  if ((await isBranchExist(ref, tmpDir)) === true) {
    await executeBatchProcess([
      `cd ${tmpDir}`,
      git.configUser(email, name),
      git.checkoutRef(ref),
      git.renameBranch(ref, newBranch),
      git.pushUpstream(newBranch),
      git.removeRemoteBranch(ref),
      `rm -rf ${tmpDir}`,
    ]);
  } else console.log(`Remote branch name "${ref} is not exisit."`);
}
