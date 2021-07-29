import { Service } from '@src/types/Service';
import { logger, setIpcReplier, store } from '@src/utils';
import { app } from 'electron';
import schedule from 'node-schedule';

export class AppService extends Service {
  run() {
    setIpcReplier('check-update', this.checkUpdate.bind(this));

    this.app.on('app-ready', this.startup.bind(this));
    this.app.on('start-work', this.startWork.bind(this));
    this.app.on('stop-work', this.stopWork.bind(this));
    this.app.on('set-token', this.setToken.bind(this));
    app.on('will-quit', this.appWillQuit.bind(this));
  }

  private setToken({ access_token, refresh_token }) {
    this.app.context.access_token = access_token;
    this.app.context.refresh_token = refresh_token;
  }

  /**
   * 登录后开始检查更新及刷新token
   *
   * @private
   * @memberof AppService
   */
  private startWork() {
    // 使用crontab调度任务
    schedule.scheduleJob('check-update', '*/30 * * * * *', this.autoCheckUpdate.bind(this));
    schedule.scheduleJob('refresh-token', '*/30 * * * *', this.refreshToken.bind(this));
  }

  /**
   * 登初后取消检查更新及刷新token
   *
   * @private
   * @memberof AppService
   */
  private stopWork() {
    schedule.cancelJob('check-update');
    schedule.cancelJob('refresh-token');
  }

  private autoCheckUpdate() {
    if (!store.get('autoUpdate')) {
      return;
    }

    this.checkUpdate();
  }

  private async checkUpdate() {
    const info = await this.app.updater.checkForUpdate();
    if (!info) {
      return;
    }
    logger.debug('更新信息', info);

    this.app.context.updateInfo = info.updateInfo;
    this.app.emit('show-update-window');
  }

  /**
   * 心跳，处理定期更新token
   *
   * @memberof AppService
   */
  public async refreshToken() {
    try {
      const { access_token, refresh_token, overdue } = await this.app.http.refreshToken();
      // 是否过期
      if (overdue) {
        this.stopWork();
        this.app.emit('login-window');
      } else {
        logger.debug('新的token:', access_token, refresh_token);
        this.app.emit('set-token', { access_token, refresh_token });
      }
    } catch (e) {
      logger.error(e);
    }
  }

  private appWillQuit() {
    app.exit(0);
  }

  private startup() {}
}
