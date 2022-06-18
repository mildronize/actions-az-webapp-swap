import { WriteFileOptions } from 'fs';

export const constants: IConstants = {
  /**
   * If the system cannot detect any configuration, it'll be fallback to following values
   */
  FallbackValue: {
    sensitive: true,
    slotSetting: true,
  },
  DefaultEncoding: 'utf8',
  WorkingDirectory: 'swap-tmp-path',
  gitConfig: {
    name: 'GitHub Action Swap Bot',
    email: 'github-swap-bot@github.com',
  },
};

interface IConstants {
  FallbackValue: {
    sensitive: boolean;
    slotSetting: boolean;
  };
  DefaultEncoding: WriteFileOptions;
  WorkingDirectory: string;
  gitConfig: {
    name: string;
    email: string;
  };
}
