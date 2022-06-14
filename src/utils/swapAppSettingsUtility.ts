export function isSwapAppSettingExisting(name: string, appSettings: { name: string }[]) {
  let index = 0;
  for (const appSetting of appSettings) {
    if (appSetting.name === name) return index;
    index++;
  }
  return -1;
}
