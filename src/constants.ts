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
};

interface IConstants {
  FallbackValue: {
    sensitive: boolean;
    slotSetting: boolean;
  };
  DefaultEncoding: WriteFileOptions;
  WorkingDirectory: string;
}
