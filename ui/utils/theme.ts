import { Themes } from '@ui/types/Themes';
import { remote } from 'electron';
import { ipcSend } from './ipcRequest';

export const switchSkin = async () => {
  let theme: Themes = await ipcSend('get-theme');
  theme = theme === 'light' ? 'dark' : 'light';
  setTheme(theme);
  await ipcSend('set-theme', theme);
};

export const setTheme = theme => {
  const body = document.getElementsByTagName('body')[0];
  body.className = `body-wrap-${theme}` as any;
};

// 通过统一的入口处理全屏，解决isMaximized获取不到的问题
class Size {
  isMax = false;

  maxSize = () => {
    if (this.isMax) {
      remote.getCurrentWindow().unmaximize();
      remote.getCurrentWindow().movable = true;
      document.querySelector('html')!.classList.remove('fullscreen');
    } else {
      remote.getCurrentWindow().maximize();
      remote.getCurrentWindow().movable = false;
      document.querySelector('html')!.classList.add('fullscreen');
    }
    this.isMax = !this.isMax;
  };

  isMaxsize = (): boolean => {
    return this.isMax;
  };
}
const size = new Size();

/**
 * @description 最大化
 */

export const maxSize = size.maxSize;
export const isMaxsize = size.isMaxsize;

/**
 * @description 最小化
 */
export const miniSize = () => {
  remote.getCurrentWindow().minimize();
};
