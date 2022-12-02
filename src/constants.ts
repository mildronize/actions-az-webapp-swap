import { WriteFileOptions } from 'fs';

interface IConstants {
  FallbackValue: {
    sensitive: boolean;
    slotSetting: boolean;
  };
  DefaultEncoding: WriteFileOptions;
  WorkingDirectory: {
    root: string;
    beforeSwap: string;
    afterSwap: string;
  };

  gitConfig: {
    name: string;
    email: string;
  };
}

export const constants: IConstants = {
  /**
   * If the system cannot detect any configuration, it'll be fallback to following values
   */
  FallbackValue: {
    sensitive: true,
    slotSetting: true,
  },
  DefaultEncoding: 'utf8',
  WorkingDirectory: {
    root: 'app-settings',
    beforeSwap: 'before-swap',
    afterSwap: 'after-swap',
  },
  gitConfig: {
    name: 'GitHub Action Swap Bot',
    email: 'github-swap-bot@github.com',
  },
};
