import { app } from 'electron';
import { EventEmitter } from 'events';
import { Http } from './lib/http';
import { Updater } from './lib/updater';
import { AppService } from './service/app.service';
import { IpcService } from './service/ipc.service';
import { OrderService } from './service/order.service';
import { WindowService } from './service/window.service';
import { Context } from './types';
import { logger } from './utils';
import { database } from './utils/database';

export class Application extends EventEmitter {
  // app公用状态
  public readonly context = new Context();

  // app公用逻辑模块
  public readonly windowService = new WindowService();
  public readonly appService = new AppService();
  public readonly ipcService = new IpcService();

  // app公用lib
  public updater = new Updater(this);
  public http = new Http(this);

  // 业务逻辑模块
  public readonly orderService = new OrderService();

  public run() {
    this.windowService.plugin(this);
    this.appService.plugin(this);
    this.ipcService.plugin(this);
    this.orderService.plugin(this);

    this.start();
  }

  private start() {
    if (hasStartParam()) {
      // 协议唤起或者附加了启动参数需要处理
      const { argv } = process;
      logger.info('启动参数', argv);
      // 如果启动参数类似于url query参数可用以下代码解析,可以用于协议唤起应用的参数解析
      // const data: LoginData = qs.parse(url.parse(argv[0]).query as string) as any;
      // const data: LoginData = qs.parse(url.parse('?account=abc&password=a123456').query as string) as any;
      this.emit('app-ready');
    } else {
      this.emit('app-ready');
    }
  }
}

/**
 * 是否有启动参数
 *
 * @return {*}
 */
const hasStartParam = (): boolean => {
  const { argv } = process;
  return app.isPackaged && argv.length > 1;
};

interface LoginData {
  account: string;
  password: string;
}
