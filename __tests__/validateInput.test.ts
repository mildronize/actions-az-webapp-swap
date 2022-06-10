// import { wait } from '../src/wait';
// import * as process from 'process';
// import * as cp from 'child_process';
// import * as path from 'path';

// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10);
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number');
// });

// test('wait 500 ms', async () => {
//   const start = new Date();
//   await wait(500);
//   const end = new Date();
//   var delta = Math.abs(end.getTime() - start.getTime());
//   expect(delta).toBeGreaterThan(450);
// });

// // shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   process.env['INPUT_MILLISECONDS'] = '500';
//   const np = process.execPath;
//   const ip = path.join(__dirname, '..', 'lib', 'main.js');
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env,
//   };
//   console.log(cp.execFileSync(np, [ip], options).toString());
// });
import { expect, test } from '@jest/globals';
import { AppSettingProperty } from '../src/interfaces/ISwapAppService';
import { validateAppSettings, IValidateAppSettingsReturnType } from '../src/validateInput';

test('test validateAppSettings', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.required,
    defaultSlotSetting: AppSettingProperty.required,
    appSettings: [
      {
        name: 'ANOTHER',
        sensitive: false,
        slotSetting: true,
      },
      {
        name: 'Test',
        sensitive: true,
        slotSetting: true,
      },
    ],
  };
  const appSettings = [
    {
      name: 'ANOTHER',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'Test',
      value: '',
      slotSetting: true,
    },
  ];
  expect(validateAppSettings(swapAppService, appSettings)).toStrictEqual({
    success: true,
    error: '',
  });
});
