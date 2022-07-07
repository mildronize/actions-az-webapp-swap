import { expect, test } from '@jest/globals';
import { AppSettingsType } from '../src/core/AppSettingsBase';
import AppSettingsMasking from '../src/core/AppSettingsMasking';
import { DefaultSensitiveEnum, DefaultSlotSettingEnum, IAppSetting, ISwapAppService } from '../src/interfaces';

const globalConfig = {
  name: 'app-name',
  resourceGroup: 'resourceGroup name',
  slot: 'production',
  targetSlot: 'staging',
  defaultSensitive: DefaultSensitiveEnum.required,
  defaultSlotSetting: DefaultSlotSettingEnum.required,
};

test('AppSettingsMasking.mask() (AppSettings) should return hash value in appSettings if sensitive is true', () => {
  const swapAppService: ISwapAppService = {
    ...globalConfig,
    connectionStrings: [],
    appSettings: [
      {
        name: 'data',
        sensitive: true,
        slotSetting: true,
      },
    ],
  };

  const appSettings: IAppSetting[] = [
    {
      name: 'data',
      value: 'value',
      slotSetting: true,
    },
  ];

  const expected: IAppSetting[] = [
    {
      name: 'data',
      value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
      slotSetting: true,
    },
  ];

  const appSettingsMasking = new AppSettingsMasking(swapAppService, AppSettingsType.AppSettings);
  expect(expected).toStrictEqual(appSettingsMasking.mask(appSettings, 'staging'));
});

test('AppSettingsMasking.mask() (AppSettings) should return actual value in appSettings if sensitive is false', () => {
  const swapAppService: ISwapAppService = {
    ...globalConfig,
    connectionStrings: [],
    appSettings: [
      {
        name: 'data',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };

  const appSettings: IAppSetting[] = [
    {
      name: 'data',
      value: 'value',
      slotSetting: true,
    },
  ];

  const expected: IAppSetting[] = [
    {
      name: 'data',
      value: 'value',
      slotSetting: true,
    },
  ];

  const appSettingsMasking = new AppSettingsMasking(swapAppService, AppSettingsType.AppSettings);
  expect(appSettingsMasking.mask(appSettings, 'staging')).toStrictEqual(expected);
});

test('AppSettingsMasking.mask() (connectionStrings) should return always hash value in connectionStrings if sensitive is true', () => {
  const swapAppService: ISwapAppService = {
    ...globalConfig,
    connectionStrings: [
      {
        name: 'data',
        sensitive: true,
        slotSetting: true,
      },
    ],
    appSettings: [],
  };

  const appSettings: IAppSetting[] = [
    {
      name: 'data',
      value: 'value',
      slotSetting: true,
    },
  ];

  const expected: IAppSetting[] = [
    {
      name: 'data',
      value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
      slotSetting: true,
    },
  ];

  const appSettingsMasking = new AppSettingsMasking(swapAppService, AppSettingsType.ConnectionStrings);
  expect(appSettingsMasking.mask(appSettings, 'staging')).toStrictEqual(expected);
});

test('AppSettingsMasking.mask() (connectionStrings) should return always hash value in connectionStrings if sensitive is false', () => {
  const swapAppService: ISwapAppService = {
    ...globalConfig,
    connectionStrings: [
      {
        name: 'data',
        sensitive: false,
        slotSetting: true,
      },
    ],
    appSettings: [],
  };

  const appSettings: IAppSetting[] = [
    {
      name: 'data',
      value: 'value',
      slotSetting: true,
    },
  ];

  const expected: IAppSetting[] = [
    {
      name: 'data',
      value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
      slotSetting: true,
    },
  ];

  const appSettingsMasking = new AppSettingsMasking(swapAppService, AppSettingsType.ConnectionStrings);
  expect(appSettingsMasking.mask(appSettings, 'staging')).toStrictEqual(expected);
});
