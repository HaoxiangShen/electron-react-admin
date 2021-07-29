import { CloseType } from '@src/types/SystemConfigState';
import ElectronStore from 'electron-store';
import md5 from 'md5';
import { machineIdSync } from 'node-machine-id';

/**
 * 持久化配置信息
 *
 * @class Store
 */
class Store {
  private store: ElectronStore;

  constructor() {
    this.store = new ElectronStore({
      name: process.env.NODE_ENV !== 'production' ? 'config.dev' : 'config',
      schema: {
        autologin: { type: 'boolean', default: false },
        autoUpdate: { type: 'boolean', default: false },
        closeWindow: { type: 'number', default: CloseType.退出 },
        userData: { type: 'array', default: [] },
      },
      encryptionKey: md5(machineIdSync()),
    });
  }

  public get(key: keyof Storage, defaultValue: string = '') {
    return this.store.get(key, defaultValue);
  }

  public set(key: keyof Storage, value: any) {
    this.store.set(key, value);
  }

  public delete(key: keyof Storage) {
    this.store.delete(key);
  }
}

const store = new Store();

export { store };
