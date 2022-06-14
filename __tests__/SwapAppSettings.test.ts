import { expect, test } from '@jest/globals';
import {
  DefaultSensitiveEnum,
  DefaultSlotSettingEnum,
  IAppSetting,
  ISwapAppService,
} from '../src/interfaces/ISwapAppService';
import SwapAppSettings from '../src/core/SwapAppSettings';

const globalConfig = {
  name: 'app-name',
  resourceGroup: 'resourceGroup name',
  slot: 'production',
  targetSlot: 'staging',
};

// test('test SwapAppSettings slotSettings in Fail Case', () => {
//   const sharedConfig = {
//     ...globalConfig,
//     defaultSensitive: DefaultSensitiveEnum.false,
//     defaultSlotSetting: DefaultSlotSettingEnum.required,
//   };
//   const swapAppService: ISwapAppService = {
//     ...sharedConfig,
//     appSettings: [
//       {
//         name: 'config_1',
//         sensitive: false,
//         slotSetting: true,
//       },
//     ],
//   };
//   const appSettings: IAppSetting[] = [
//     {
//       name: 'config_1',
//       value: 'false',
//       slotSetting: true,
//     },
//   ];

//   expect(() => new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toThrow(
//     `Cannot fulfill swap app service from giving app setting because all slotSettings is required`
//   );
// });

// test('test SwapAppSettings SensitiveEnum in Fail Case', () => {
//   const sharedConfig = {
//     ...globalConfig,
//     defaultSensitive: DefaultSensitiveEnum.required,
//     defaultSlotSetting: DefaultSlotSettingEnum.false,
//   };
//   const swapAppService: ISwapAppService = {
//     ...sharedConfig,
//     appSettings: [
//       {
//         name: 'config_1',
//         sensitive: false,
//         slotSetting: true,
//       },
//     ],
//   };
//   const appSettings: IAppSetting[] = [
//     {
//       name: 'config_1',
//       value: 'false',
//       slotSetting: true,
//     },
//   ];

//   expect(() => new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toThrow(
//     `Cannot fulfill swap app service from giving app setting because all sensitive is required`
//   );
// });

test('test SwapAppSettings slotSettings if one app setting is missing (defaultSlotSetting = false)', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.false,
    defaultSlotSetting: DefaultSlotSettingEnum.false,
  };
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];
  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: false,
        slotSetting: false,
        baseSlotSetting: true,
        slots: ['production'],
      },
    ],
  });
});

test('test SwapAppSettings slotSettings if one app setting is missing (defaultSlotSetting = true)', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.false,
    defaultSlotSetting: DefaultSlotSettingEnum.true,
  };
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: false,
    },
  ];
  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: false,
        slots: ['production'],
      },
    ],
  });
});

test('test SwapAppSettings slotSettings if one app setting is missing (defaultSlotSetting = inherit)', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.false,
    defaultSlotSetting: DefaultSlotSettingEnum.inherit,
  };
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];
  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
    ],
  });
});

test('test SwapAppSettings sensitive if one app setting is missing (defaultSensitive = true)', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.true,
    defaultSlotSetting: DefaultSlotSettingEnum.false,
  };
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];

  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: true,
        slotSetting: false,
        baseSlotSetting: true,
        slots: ['production'],
      },
    ],
  });
});

test('test SwapAppSettings SlotSetting override exisitng app settings (defaultSlotSetting = true)', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.false,
    defaultSlotSetting: DefaultSlotSettingEnum.true,
  };
  const swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
      {
        name: 'config_2',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: false,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: false,
    },
  ];
  expect(new SwapAppSettings(swapAppService).fullfill(appSettings, 'production')).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: false,
        slots: ['production'],
      },
      {
        name: 'config_2',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: false,
        slots: ['production'],
      },
    ],
  });
});

test('test SwapAppSettings which fullfill can be stacked', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.true,
    defaultSlotSetting: DefaultSlotSettingEnum.false,
  };
  let swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];

  const swapAppSettings = new SwapAppSettings(swapAppService);
  swapAppService = swapAppSettings.fullfill(appSettings, 'production');
  expect(swapAppService).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: true,
        slotSetting: false,
        baseSlotSetting: true,
        slots: ['production'],
      },
    ],
  });
  swapAppService = swapAppSettings.fullfill(appSettings, 'staging');
  expect(swapAppService).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production', 'staging'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: true,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production', 'staging'],
      },
    ],
  });
});

test('test SwapAppSettings which fullfill can be merged', () => {
  const sharedConfig = {
    ...globalConfig,
    defaultSensitive: DefaultSensitiveEnum.true,
    defaultSlotSetting: DefaultSlotSettingEnum.false,
  };
  let swapAppService: ISwapAppService = {
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: false,
      },
    ],
  };
  const appSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: false,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];

  const swapAppSettings = new SwapAppSettings(swapAppService);
  swapAppService = swapAppSettings.fullfill(appSettings, 'production');
  expect(swapAppService).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: false,
        baseSlotSetting: false,
        slots: ['production'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: true,
        slotSetting: false,
        baseSlotSetting: true,
        slots: ['production'],
      },
    ],
  });

  const stagingAppSettings: IAppSetting[] = [
    {
      name: 'config_1',
      value: 'false',
      slotSetting: true,
    },
    {
      name: 'config_2',
      value: '',
      slotSetting: true,
    },
  ];

  swapAppService = swapAppSettings.fullfill(stagingAppSettings, 'staging');
  expect(swapAppService).toStrictEqual({
    ...sharedConfig,
    appSettings: [
      {
        name: 'config_1',
        sensitive: false,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production', 'staging'],
      },
      // This field is fullfill by giving appSettings from production slot
      {
        name: 'config_2',
        sensitive: true,
        slotSetting: true,
        baseSlotSetting: true,
        slots: ['production', 'staging'],
      },
    ],
  });
});
