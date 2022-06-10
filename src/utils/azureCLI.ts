import { executeProcess } from './executeProcess';
import { IAppSetting } from '../interfaces/ISwapAppService';
import { stripIndent } from 'common-tags';

const azureCommands = {
  webAppListAppSettings: (name: string, resourceGroup: string) => stripIndent`
      az webapp config appsettings list \\
          --name ${name} \\
          --resource-group ${resourceGroup}
  `,
};

export async function webAppListAppSettings(name: string, resourceGroup: string): Promise<IAppSetting[]> {
  const result = await executeProcess(azureCommands.webAppListAppSettings(name, resourceGroup));
  if (result.stdout instanceof Buffer) {
    return JSON.parse(result.stdout.toString());
  }
  return JSON.parse(result.stdout || '');
}
