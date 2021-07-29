import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';
import { format } from 'url';

export interface CreateWindowOptions extends BrowserWindowConstructorOptions {
  lazyRender?: boolean;
  close?(): void;
}

export abstract class Window {
  private window: BrowserWindow;
  protected abstract width: number;
  protected abstract height: number;
  /**
   * 此处名称需要与需要加载的窗口保持一致,即@ui/entry中文件名保持一致
   *
   * @protected
   * @abstract
   * @type {string}
   * @memberof Window
   */
  protected abstract name: string;

  public getName = () => {
    return this.name;
  };

  public createWindow(options?: CreateWindowOptions) {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: this.width,
        height: this.height,
        resizable: false,
        frame: false,
        show: false,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          // devTools: !app.isPackaged,
          devTools: true,
        },
        ...options,
      });

      if (!options?.lazyRender) {
        this.window.once('ready-to-show', this.window.show);
      }

      this.window.webContents.once('crashed', () => app.relaunch());

      this.window.webContents.once('dom-ready', () => {
        this.created();
        resolve(undefined);
      });

      this.window.once('close', () => {
        if (options?.close) {
          options?.close();
        }
      });

      if (app.isPackaged) {
        this.window.loadURL(
          format({
            protocol: 'file:',
            slashes: true,
            pathname: join(__dirname, `./dist/ui/${this.name}.html`),
          }),
        );
      } else {
        this.window.loadURL(`http://localhost:8000/${this.name}.html`);
      }
    });
  }

  abstract created(): void;

  public getWindow() {
    return this.window;
  }

  public send(channel: string, ...args: any[]) {
    this.window?.webContents?.send(channel, ...args);
  }

  public show() {
    this.window?.show();
  }

  public close() {
    this.window?.close();
  }

  public hide() {
    this.window?.hide();
  }

  public setAlwaysOnTop(
    flag: boolean,
    level:
      | 'normal'
      | 'floating'
      | 'torn-off-menu'
      | 'modal-panel'
      | 'main-menu'
      | 'status'
      | 'pop-up-menu'
      | 'screen-saver' = 'normal',
    relativeLevel: number = 0,
  ) {
    this.window?.setAlwaysOnTop(flag, level, relativeLevel);
  }
}
