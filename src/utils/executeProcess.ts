import crypto from 'crypto';
import { spawn } from 'promisify-child-process';

interface IOption {
  slient?: boolean;
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

export function hashValue(value: string) {
  const sha256Hasher = crypto.createHmac('sha3-512', process.env.HASH_SECRET || '');
  return sha256Hasher.update(value).digest('base64');
}
