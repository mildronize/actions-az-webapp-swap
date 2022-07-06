import { executeProcess, parseBufferToString } from './executeProcess';
import { IAppSetting } from '../interfaces';
import { stripIndent } from 'common-tags';
import { Output } from 'promisify-child-process';

export const azureCommands = {
  webAppListAppSettings: (name: string, resourceGroup: string, slot?: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    return stripIndent`
      az webapp config appsettings list \\
          --name ${name} \\
          ${azSlotCommand} \\
          --resource-group ${resourceGroup}
  `;
  },

  webAppListConnectionStrings: (name: string, resourceGroup: string, slot?: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    return stripIndent`
      az webapp config connection-string list \\
          --name ${name} \\
          ${azSlotCommand} \\
          --resource-group ${resourceGroup}
  `;
  },

  webAppSetConnectionString: (name: string, resourceGroup: string, appSetting: IAppSetting, slot?: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    /**
     * Note: Due to Azure CLI version 2.35.0,
     * If using `--settings` in the code, no matter slotSettings in Azure is True or False,
     * the slotSettings will not change to be `false`
     *
     * In Addition, if using `--slot-settings`, it can override config slotSettings in Azure to be `true`
     *
     * Ref: https://docs.microsoft.com/en-us/cli/azure/webapp/config/connection-string?view=azure-cli-latest#az-webapp-config-connection-string-set
     */
    const slotSettingCommand = appSetting.slotSetting === true ? '--slot-settings' : '--settings';
    const key = appSetting.name.replaceAll('"', '\\"');
    const value = appSetting.value.replaceAll('"', '\\"');
    return stripIndent`
      az webapp config connection-string set \\
          --name ${name} \\
          ${azSlotCommand} \\
          --connection-string-type ${appSetting.type} \\
          --resource-group ${resourceGroup} \\
          ${slotSettingCommand} "${key}"="${value}"
  `;
  },

  webAppSetAppSettingsByFile: (name: string, resourceGroup: string, slot: string, appSettingPath: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    return stripIndent`
      az webapp config appsettings set \\
        --name ${name} \\
        --resource-group ${resourceGroup} \\
        ${azSlotCommand} \\
        --settings @${appSettingPath}
    `;
  },

  webAppDeploySlotSwap: (name: string, resourceGroup: string, slot: string, targetSlot: string) => {
    return stripIndent`
      az webapp deployment slot swap \\
        --name ${name} \\
        --resource-group ${resourceGroup} \\
        --slot ${slot} \\
        --target-slot ${targetSlot}
    `;
  },
};

export async function webAppListConnectionStrings(
  name: string,
  resourceGroup: string,
  slot?: string
): Promise<IAppSetting[]> {
  const result = await executeProcess(azureCommands.webAppListConnectionStrings(name, resourceGroup, slot));
  return JSON.parse(parseBufferToString(result.stdout));
}

export async function webAppSetConnectionStrings(
  name: string,
  resourceGroup: string,
  slot: string,
  appSettings: IAppSetting[]
) {
  /**
   * Because Azure CLI cannot use set JSON file with connection string
   * https://docs.microsoft.com/en-us/cli/azure/webapp/config/connection-string?view=azure-cli-latest#az-webapp-config-connection-string-set
   * This function require to set connection string individually
   */
  const workers: Promise<Output>[] = [];
  for (const appSetting of appSettings) {
    workers.push(executeProcess(azureCommands.webAppSetConnectionString(name, resourceGroup, appSetting, slot)));
  }
  await Promise.all(workers);
}

export async function webAppListAppSettings(
  name: string,
  resourceGroup: string,
  slot?: string
): Promise<IAppSetting[]> {
  const result = await executeProcess(azureCommands.webAppListAppSettings(name, resourceGroup, slot));
  return JSON.parse(parseBufferToString(result.stdout));
}

export async function webAppSetAppSettings(
  name: string,
  resourceGroup: string,
  slot: string,
  appSettingPath: string
): Promise<Output> {
  return await executeProcess(azureCommands.webAppSetAppSettingsByFile(name, resourceGroup, slot, appSettingPath));
}

export async function webAppSwap(
  name: string,
  resourceGroup: string,
  slot: string,
  targetSlot: string
): Promise<Output> {
  return await executeProcess(azureCommands.webAppDeploySlotSwap(name, resourceGroup, slot, targetSlot));
}
