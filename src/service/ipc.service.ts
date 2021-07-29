import { Service } from '@src/types/Service';
import { SystemConfigState } from '@src/types/SystemConfigState';
import { logger, native, registry, setAutoStartup, setIpcReplier } from '@src/utils';
import { store } from '@src/utils/store';
import child_process from 'child_process';
import { app } from 'electron';
import ffi from 'ffi-napi';

export class IpcService extends Service {
  run() {
    setIpcReplier('save-user-account', this.saveUserAccounts.bind(this));
    setIpcReplier('get-user-account', this.getUserAccounts.bind(this));
    setIpcReplier('get-sys-config', this.getSystemConfig.bind(this));
    setIpcReplier('set-sys-config', this.setSystemConfig.bind(this));
    setIpcReplier('get-reg-config', this.getReg.bind(this));
    setIpcReplier('set-reg-config', this.setReg.bind(this));
    setIpcReplier('get-context', this.getContext.bind(this));
    setIpcReplier('get-mac', async () => native.machine);
    setIpcReplier('app-login', this.login.bind(this));
    setIpcReplier('app-logout', this.logout.bind(this));
    setIpcReplier('call-dll', this.dll.bind(this));
    setIpcReplier('get-start-param', this.getStartParam.bind(this));
  }

  getStartParam = async () => {
    const { argv } = process;
    return argv;
  };

  dll = async () => {
    function showText(text) {
      return new Buffer(text, 'ucs2').toString('binary');
    }

    const myUser32 = new ffi.Library('user32', {
      // 声明这个dll中的一个函数
      MessageBoxW: [
        'int32',
        ['int32', 'string', 'string', 'int32'], // 用json的格式罗列其返回类型和参数类型
      ],
    });
    const isOk = myUser32.MessageBoxW(0, showText('I am Node.JS!'), showText('Hello, World!'), 1);
  };

  /**
   * 读取注册表
   *
   * @param {string} key
   * @memberof IpcService
   */
  getReg = async (key: string) => {
    return registry.get(key);
  };

  /**
   * 设置注册表
   *
   * @param {string} key
   * @param {string} value
   * @memberof IpcService
   */
  setReg = async (key: string, value: string) => {
    registry.set(key, value);
    return;
  };

  login = async params => {
    const res = await this.app.http.login(params);
    const { access_token, refresh_token, userName } = res;
    this.app.emit('set-token', { access_token, refresh_token });
    this.app.emit('start-work');
    logger.info('登录成功', res);
    this.app.context.userName = userName;
    this.app.emit('workspace-window');
    return;
  };

  logout = async () => {
    try {
      await this.app.http.logout();
    } catch (error) {}
    this.app.emit('stop-work');
    this.app.context.access_token = undefined;
    this.app.context.refresh_token = undefined;
    this.app.context.userName = undefined;
    this.setSystemConfig({ autologin: false });
    this.app.emit('login-window');
    return;
  };

  /* 读取系统设置配置 */
  getSystemConfig = async () => {
    let data: SystemConfigState = {
      autostart: app.getLoginItemSettings().openAtLogin,
      autologin: store.get('autologin'),
      autoUpdate: store.get('autoUpdate'),
      closeWindow: store.get('closeWindow'),
    };
    return data;
  };

  /* 存储系统设置配置 */
  setSystemConfig = async (data: Partial<SystemConfigState>) => {
    saveMapStore(data);
    if (data.hasOwnProperty('autostart')) {
      setAutoStartup(data.autostart!);
    }
    return;
  };

  /* 存储用户数据 */
  saveUserAccounts = async data => {
    try {
      store.set('userData', data);
    } catch (e) {
      logger.error(e);
      throw new Error('存储用户信息失败');
    }
  };
  /* 读取用户账号 */
  getUserAccounts = async () => {
    try {
      return store.get('userData');
    } catch (e) {
      logger.error(e);
      throw new Error('读取用户账号失败');
    }
  };

  /**
   * 获取全局数据
   *
   * @memberof IpcService
   */
  getContext = async () => {
    return this.app.context;
  };

  /**
   * 执行本地命令
   *
   * @memberof IpcService
   */
  excuteFile = async () => {
    child_process.spawn('执行本地命令', {
      detached: true,
    });
  };
}

function saveMapStore(data: any) {
  for (const k in data) {
    store.set(k, data[k]);
  }
}
