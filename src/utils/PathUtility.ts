import path from 'path';
import fs from 'fs';

export class PathUtility {
  private rootDir: string = '';

  constructor(private rootPath: string) {}

  public getRootDir(resourceGroup: string) {
    return path.join(this.rootPath, resourceGroup);
  }

  public getAppSettingsPath(resourceGroup: string, appName: string, slot: string) {
    this.rootDir = this.getRootDir(resourceGroup);
    return path.join(this.rootDir, `${appName}-${slot}.appsettings.json`);
  }

  public createDir(resourceGroup: string) {
    this.rootDir = this.getRootDir(resourceGroup);
    if (!fs.existsSync(this.rootDir)) {
      fs.mkdirSync(this.rootDir, { recursive: true });
    }
  }

  public clean() {
    if (fs.existsSync(this.rootPath)) {
      fs.rmSync(this.rootPath, { recursive: true, force: true });
    }
  }
}
