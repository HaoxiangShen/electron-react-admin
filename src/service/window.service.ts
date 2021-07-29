import { Service } from '@src/types/Service';
import { CreateWindowOptions, Window } from '@src/types/Window';
import { logger, setIpcReplier } from '@src/utils';
import { getStaticPath } from '@src/utils/file';
import { Themes } from '@ui/types/Themes';
import { app, BrowserWindow, Menu, Tray } from 'electron';
import path from 'path';
import { LoginWindow, WorkspaceWindow, UpdateWindow } from '../windows';

export class WindowService extends Service {
  private window: Window | null;
  private tray: Tray | null;
  private loginWindow = new LoginWindow();
  private workspaceWindow = new WorkspaceWindow();
  private updateWindow = new UpdateWindow();

  run() {
    app.on('second-instance', this.secondInstance.bind(this));

    this.app.on('app-ready', this.showLoginWindow.bind(this));
    this.app.on('login-window', this.showLoginWindow.bind(this));
    this.app.on('workspace-window', this.showWorkspaceWindow.bind(this));
    this.app.on('show-update-window', this.showUpdateWindow.bind(this));
    this.app.on('update-progress', this.onUpdateProgress.bind(this));

    setIpcReplier('get-curr-window', async () => this.window?.getName());
    setIpcReplier('is-tray', async () => this.tray !== null);
    setIpcReplier('get-theme', this.getTheme.bind(this));
    setIpcReplier('set-theme', this.setTheme.bind(this));
    setIpcReplier('app-close', this.close.bind(this));
    setIpcReplier('workspace-window', this.showWorkspaceWindow.bind(this));
    setIpcReplier('hide-to-tray', this.hideToTray.bind(this));
  }

  private onUpdateProgress(progress: string) {
    this.updateWindow.getWindow().webContents.send('update-progress', progress);
  }

  private secondInstance() {
    const currWindow = this.window?.getWindow();
    if (!currWindow) {
      return;
    }

    currWindow.isMinimized() && currWindow.restore();
    currWindow.focus();
  }

  public async close() {
    app.exit();
  }

  private async showUpdateWindow() {
    await this.showWindow(this.updateWindow);
    this.app.updater.downloadExe();
  }

  public async showWorkspaceWindow() {
    await this.showWindow(this.workspaceWindow, { minWidth: 1280, minHeight: 720, resizable: true, movable: true });
  }

  public async showLoginWindow() {
    await this.showWindow(this.loginWindow);
  }

  public getWindow(): BrowserWindow {
    return this.window?.getWindow() as BrowserWindow;
  }

  private async showWindow(window?: Window, options?: CreateWindowOptions) {
    logger.debug('打开窗口', window?.getName());
    if (!window) {
      this.window?.show();
    } else if (this.window === window) {
      this.window?.show();
    } else if (this.window !== window) {
      this.window?.hide();
      if (!window.getWindow()) {
        await window.createWindow(options);
      } else {
        window.show();
      }
      this.window = window;
    }
  }

  private getTheme = () => {
    return this.app.context.theme;
  };

  private setTheme = (theme: Themes) => {
    this.app.context.theme = theme;
    if (this.workspaceWindow.getWindow()) {
      this.workspaceWindow.getWindow().webContents.send('theme-change', theme);
    }
    return;
  };

  private hideToTray() {
    this.window?.getWindow().hide();

    if (this.tray) return;

    this.tray = new Tray(path.resolve(getStaticPath(), 'electron.jpg'));

    this.tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: '退出',
          click: async () => app.quit(),
        },
      ]),
    );
    this.tray.addListener('click', () => {
      this.showWindow();
      this.tray?.destroy();
      this.tray = null;
    });
  }
}
