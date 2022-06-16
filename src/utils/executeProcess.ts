import { spawn, Output } from 'promisify-child-process';
import chalk from 'chalk';

interface IOption {
  slient?: boolean;
}

export function parseBufferToString(data: Buffer | string | null | undefined): string {
  if (data instanceof Buffer) return data.toString();
  return data || '';
}

export async function executeBatchProcess(commands: string[], option?: IOption) {
  const mergedCommand = commands.join(' && ');
  return await executeProcess(mergedCommand, option);
}

export async function executeProcess(command: string, option?: IOption) {
  const slient = option?.slient ? option?.slient : false;
  if (!slient) console.debug(`Executing... ${command}`);
  const childProcess = spawn(command, { encoding: 'utf8', maxBuffer: 200 * 1024, shell: true });

  childProcess.stdout?.on('data', function (data: any) {
    if (!slient) console.debug(chalk.blue(data.toString()));
  });

  childProcess.stderr?.on('data', function (data: any) {
    console.error(chalk.red(data.toString()));
  });

  childProcess.on('exit', function (code: any) {
    if (!slient) console.log('child process exited with code ' + code);
  });

  return await childProcess;
}
