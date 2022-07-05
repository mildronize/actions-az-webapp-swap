import { expect, test } from '@jest/globals';
import InputValidation from '../src/validation/InputValidation';
import { DefaultSensitiveEnum, DefaultSlotSettingEnum, ISwapAppService } from '../src/interfaces/ISwapAppService';

const swapAppService: Partial<ISwapAppService> = {
  name: '',
  resourceGroup: '',
  slot: '',
  targetSlot: '',
  defaultSensitive: DefaultSensitiveEnum.true,
  defaultSlotSetting: DefaultSlotSettingEnum.required,
};

test('InputValidation.validate appSettings is undefined should return appSettings with empty list', () => {
  const actual = InputValidation.validate(swapAppService);

  const expected: Partial<ISwapAppService> = {
    ...swapAppService,
    appSettings: [],
  };

  expect(actual).toStrictEqual(expected);
});

test('InputValidation.validate connectionStrings is undefined should return connectionStrings with empty list', () => {
  const actual = InputValidation.validate(swapAppService);

  const expected: Partial<ISwapAppService> = {
    ...swapAppService,
    connectionStrings: [],
  };

  expect(actual).toStrictEqual(expected);
});

test('InputValidation.validateArray appSettings is undefined should return appSettings with empty list', () => {
  const actual = InputValidation.validateArray([swapAppService]);

  const expected: Partial<ISwapAppService>[] = [
    {
      ...swapAppService,
      appSettings: [],
    },
  ];

  expect(actual).toStrictEqual(expected);
});

test('InputValidation.validateArray connectionStrings is undefined should return connectionStrings with empty list', () => {
  const actual = InputValidation.validateArray([swapAppService]);

  const expected: Partial<ISwapAppService>[] = [
    {
      ...swapAppService,
      connectionStrings: [],
    },
  ];

  expect(actual).toStrictEqual(expected);
});
