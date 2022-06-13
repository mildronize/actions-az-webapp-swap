import { expect, test } from '@jest/globals';
import { DefaultSensitiveEnum, DefaultSlotSettingEnum, IAppSetting, ISwapAppService } from '../src/interfaces/ISwapAppService';
import SwapAppSettings from '../src/core/SwapAppSettings';

const globalConfig = {
  name: 'app-name',
  resourceGroup: 'resourceGroup name',
  slot: 'production',
  targetSlot: 'staging',
}

test('test SwapAppSettings slotSettings in Pass Case', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.true,
    defaultSlotSetting: DefaultSlotSettingEnum.required,
  }
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
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
  const appSettings: IAppSetting[] = [
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
  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'ANOTHER',
        sensitive: false,
        slotSetting: true,
        slots: ['production']
      },
      {
        name: 'Test',
        sensitive: true,
        slotSetting: true,
        slots: ['production']
      },
    ],
  });
});
