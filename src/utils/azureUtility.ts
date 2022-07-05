import { executeProcess, parseBufferToString } from './executeProcess';
import { IAppSetting } from '../interfaces/ISwapAppService';
import { stripIndent } from 'common-tags';
import { Output } from 'promisify-child-process';

const azureCommands = {
  webAppListAppSettings: (name: string, resourceGroup: string, slot?: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    return stripIndent`
      az webapp config appsettings list \\
          --name ${name} \\
          ${azSlotCommand} \\
          --resource-group ${resourceGroup}
  `;
  },

  webAppListConnectionString: (name: string, resourceGroup: string, slot?: string) => {
    const azSlotCommand = slot !== 'production' && slot !== undefined ? `--slot ${slot}` : '';
    return stripIndent`
      az webapp config connection-string list \\
          --name ${name} \\
          ${azSlotCommand} \\
          --resource-group ${resourceGroup}
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
