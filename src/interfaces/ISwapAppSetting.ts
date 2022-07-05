export interface ISwapAppSetting {
  /**
   * name -- Use in input
   */
  name: string;
  /**
   * sensitive -- Use in input
   */
  sensitive: boolean;
  /**
   * slotSetting -- Use in input
   */
  slotSetting: boolean;
  /**
   * baseSlotSetting - Previous slot setting value before merge
   */
  baseSlotSetting?: boolean;
  /**
   * slots -- Slot location where the app setting will be appiled
   */
  slots?: string[];
  /**
   * value - app setting value
   */
  value?: string;
}
