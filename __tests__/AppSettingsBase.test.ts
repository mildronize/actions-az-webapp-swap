import { expect, test, describe } from '@jest/globals';
import { DefaultSensitiveEnum, DefaultSlotSettingEnum, ISwapAppService } from '../src/interfaces';
import AppSettingsBase, { AppSettingsType, IAppSettingOption } from '../src/core/AppSettingsBase';
const globalConfig = {
  name: 'app-name',
  resourceGroup: 'resourceGroup name',
  slot: 'production',
  targetSlot: 'staging',
};

test('AppSettingsBase init object should set source, target appSettings and default options', () => {
  const swapAppService: ISwapAppService = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.required,
    defaultSlotSetting: DefaultSlotSettingEnum.required,
    connectionStrings: [],
    appSettings: [
      {
        name: 'data',
        sensitive: true,
        slotSetting: true,
      },
    ],
  };
  const appSettingsBase = new AppSettingsBase(swapAppService, AppSettingsType.AppSettings);
  expect(appSettingsBase.getOptions()).toStrictEqual({
    defaultEncoding: 'utf8',
    workingDirectory: 'swap-tmp-path',
  });
  expect(appSettingsBase.getSource()).toStrictEqual([]);
  expect(appSettingsBase.getTarget()).toStrictEqual([]);
});

class AppSettingsBaseTest extends AppSettingsBase {
  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, AppSettingsType.AppSettings, options);
  }

  /** @override */
  public async list() {
    this.source = [
      {
        name: 'data',
        value: 'value',
        slotSetting: false,
      },
    ];
    this.target = [
      {
        name: 'data',
        value: 'value',
        slotSetting: false,
      },
    ];
    return this;
  }
}

describe('AppSettingsBaseTest', () => {
  test('AppSettingsBase.list().validate().fullfill().apply().mask() should set slotSetting and mask value as a secret', async () => {
    const swapAppService: ISwapAppService = {
      ...globalConfig,
      defaultSensitive: DefaultSensitiveEnum.required,
      defaultSlotSetting: DefaultSlotSettingEnum.required,
      connectionStrings: [],
      appSettings: [
        {
          name: 'data',
          sensitive: true,
          slotSetting: true,
        },
      ],
    };
    const appSettingsBase = new AppSettingsBaseTest(swapAppService);
    (await appSettingsBase.list()).validate().fullfill().apply().mask();
    expect(appSettingsBase.getTarget()).toStrictEqual([
      {
        name: 'data',
        value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
        slotSetting: true,
      },
    ]);
    expect(appSettingsBase.getSource()).toStrictEqual([
      {
        name: 'data',
        value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
        slotSetting: true,
      },
    ]);
  });
});

class ConnectionStringTest extends AppSettingsBase {
  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, AppSettingsType.ConnectionStrings, options);
  }

  /** @override */
  public async list() {
    this.source = [
      {
        name: 'data',
        value: 'value',
        slotSetting: false,
      },
    ];
    this.target = [
      {
        name: 'data',
        value: 'value',
        slotSetting: false,
      },
    ];
    return this;
  }
}

describe('ConnectionStringTest', () => {
  test('AppSettingsBase.loadAppSettings() should mask value as a secret for connectionStrings', async () => {
    const swapAppService: ISwapAppService = {
      ...globalConfig,
      defaultSensitive: DefaultSensitiveEnum.true,
      defaultSlotSetting: DefaultSlotSettingEnum.true,
      connectionStrings: [],
      appSettings: [],
    };
    const appSettingsBase = new ConnectionStringTest(swapAppService);
    await appSettingsBase.loadAppSettings();
    expect(appSettingsBase.getTarget()).toStrictEqual([
      {
        name: 'data',
        value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
        slotSetting: false,
      },
    ]);
    expect(appSettingsBase.getSource()).toStrictEqual([
      {
        name: 'data',
        value: 'ks3l7pl3EGX1QjFFGkZTcQcdizooEKftwwd8/sZ+o4aasgytauZM4N0hz30fTVkpI821ZoMzii3yMw9H6Sz9PQ==',
        slotSetting: false,
      },
    ]);
  });
});
