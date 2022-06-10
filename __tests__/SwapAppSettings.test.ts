import { expect, test } from '@jest/globals';
import { AppSettingProperty } from '../src/interfaces/ISwapAppService';
import SwapAppSettings, { validateUniqueAppSettingsName } from '../src/validation/SwapAppSettings';

test('test validateAppSettings slotSettings in Pass Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.default,
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: true,
  });
});

test('test validateAppSettings slotSettings in Fail Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.default,
    defaultSlotSetting: AppSettingProperty.required,
    appSettings: [
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: false,
    error: 'All slotSettings is required',
  });
});

test('test validateAppSettings Partial slotSettings in Fail Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.default,
    defaultSlotSetting: AppSettingProperty.required,
    appSettings: [
      {
        name: 'ANOTHER',
        sensitive: true,
        slotSetting: true,
      },
      {
        name: 'Test',
        sensitive: true,
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: false,
    error: 'All slotSettings is required',
  });
});

test('test validateAppSettings sensitive in Pass Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.required,
    defaultSlotSetting: AppSettingProperty.default,
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: true,
  });
});

test('test validateAppSettings sensitive in Fail Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.required,
    defaultSlotSetting: AppSettingProperty.default,
    appSettings: [
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: false,
    error: 'All sensitve is required',
  });
});

test('test validateAppSettings partial sensitive in Fail Case', () => {
  const swapAppService = {
    defaultSensitive: AppSettingProperty.required,
    defaultSlotSetting: AppSettingProperty.default,
    appSettings: [
      {
        name: 'ANOTHER',
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
  expect(new SwapAppSettings(swapAppService, appSettings).validate()).toStrictEqual({
    success: false,
    error: 'All sensitve is required',
  });
});

test('test validateUniqueAppSettingsName throws duplicated', async () => {
  expect(() =>
    validateUniqueAppSettingsName([
      {
        name: 'test',
      },
      {
        name: 'test',
      },
    ])
  ).toThrow(`App Setting "test" is duplicated`);
});
