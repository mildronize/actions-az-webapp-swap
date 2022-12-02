import { executeBatchProcess, executeProcess, parseBufferToString } from './executeProcess';
import { format } from 'date-fns';
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

export const github = {
  login: (tokenPath: string) => `gh auth login --with-token < ${tokenPath}`,
  createPullRequest: (repo: string, base: string, head: string, title: string, body: string) =>
    `gh pr create --base ${base} --head ${head} --repo ${repo} --title "${title}" --body "${body}"`,
};

interface IGitBase {
  repo: string;
  personalAccessToken: string;
  ref: string;
  email: string;
  name: string;
}

interface IGit extends IGitBase {
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
}: IGit): Promise<void> {
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
}: IGit): Promise<string> {
  const tmpDir = `tmp-${new Date().getTime()}`;
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
  return newBranch;
}

export async function createBranchWhenNotExist({ repo, personalAccessToken, ref, name, email }: IGitBase) {
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

interface IGitHubPullRequest extends IGitBase {
  sourceBranch: string;
}

export async function createPullRequest({ repo, personalAccessToken, ref, sourceBranch }: IGitHubPullRequest) {
  const name = `Preview App Setting After Swap ${format(new Date(), 'yyyy MM, dd - kk:mm:ss OOOO')}`;
  const tokenFile = `token-${new Date().getTime()}.txt`;
  // 1. Create PR
  await executeBatchProcess([
    `echo "${personalAccessToken}" > ${tokenFile}`,
    github.login(tokenFile),
    github.createPullRequest(
      repo,
      ref,
      sourceBranch,
      name,
      'Please consider file change in order to see what happen after swap app service slot'
    ),
    `rm -rf ${tokenFile}`,
  ]);
  // TODO: Close PR with Tags
  // 2. Create tags
}

export async function renameRemoteBranch({
  repo,
  personalAccessToken,
  ref,
  name,
  email,
}: Omit<IGit, 'targetPath' | 'rootPath' | 'message'>) {
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
