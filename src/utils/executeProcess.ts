import { spawn, Output } from 'promisify-child-process';

interface IOption {
  slient?: boolean;
}

export function parseJSON(output?: Output) {
  if (output?.stdout instanceof Buffer) {
    return JSON.parse(output?.stdout.toString());
  }
  return JSON.parse(output?.stdout || '');
}

export async function executeBatchProcess(commands: string[], option?: IOption) {
  const mergedCommand = commands.join(' && ');
  return await executeProcess(mergedCommand, option);
}

export async function executeProcess(command: string, option?: IOption) {
  const slient = option?.slient ? option?.slient : true;
  if (!slient) console.debug(`Executing... ${command}`);
  const childProcess = spawn(command, { encoding: 'utf8', maxBuffer: 200 * 1024, shell: true });

  childProcess.stdout?.on('data', function (data: any) {
    if (!slient) console.debug(data.toString());
  });

  childProcess.stderr?.on('data', function (data: any) {
    if (!slient) console.debug('stderr: ' + data.toString());
  });

  childProcess.on('exit', function (code: any) {
    if (!slient) console.log('child process exited with code ' + code);
  });

  return await childProcess;
}
