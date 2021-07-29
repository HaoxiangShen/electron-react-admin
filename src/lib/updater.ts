import delay from 'delay';
import { app } from 'electron';
import { Progress } from 'electron-dl';
import { autoUpdater, CancellationToken, UpdateCheckResult } from 'electron-updater';
import { once } from 'lodash-decorators';
import packingInfo from '../../electron-builder.json';
import { Application } from '../app';
import { logger, setIpcReplier } from '../utils';

const publishInfo = packingInfo.publish[0];

/**
 * 使用electron自带的更新机制，也可以按照实际更新改造
 * 可以将打包后release下的内容放入nginx中进行测试
 *
 * @export
 * @class Updater
 */
export class Updater {
  cancellationToken: CancellationToken | undefined;
  constructor(private readonly app: Application) {
    if (publishInfo) {
      const { provider, url } = publishInfo;
      // 设置地址要和package中的一样
      autoUpdater.setFeedURL({ provider, url, publishAutoUpdate: false });
    }

    setIpcReplier('cancel-update', this.stopUpdate.bind(this));

    // 下载监听
    autoUpdater.on('download-progress', this.onProgress.bind(this));
    autoUpdater.on('update-downloaded', this.onDownloadComplete.bind(this));
  }

  private stopUpdate = () => {
    logger.info('停止更新');
    this.cancellationToken?.cancel();
    this.cancellationToken = undefined;
  };

  public async checkForUpdate(): Promise<UpdateCheckResult | undefined> {
    if (!app.isPackaged) return undefined;
    try {
      return autoUpdater.checkForUpdates();
    } catch {
      return undefined;
    }
  }

  public async downloadExe() {
    logger.info('开始下载更新');
    this.cancellationToken = new CancellationToken();
    const res = await autoUpdater.downloadUpdate(this.cancellationToken);
    logger.info('下载更新结果', res);
    return res;
  }

  @once
  private async onDownloadComplete() {
    await delay(3000);
    this.install();
  }

  private install() {
    autoUpdater.quitAndInstall();
  }

  private onProgress(progress: Progress) {
    this.app.emit('update-progress', progress.percent.toFixed(0));
  }
}
