import '@ui/theme/global.less';
import { ipcSend } from '@ui/utils/ipcRequest';
import { setTheme } from '@ui/utils/theme';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import { remote } from 'electron';
import * as KeyCode from 'rc-util/lib/KeyCode';
import React, { useEffect } from 'react';

const Base: React.FC<any> = ({ children }) => {
  useEffect(() => {
    loadTheme();
    remote.getCurrentWindow().on('show', () => loadTheme());
  }, []);

  /* 按F12显示控制台 */
  useEffect(() => {
    document.addEventListener('keydown', e => {
      if (e.keyCode === KeyCode.default.F12) {
        if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
          remote.getCurrentWindow().webContents.closeDevTools();
        } else {
          remote.getCurrentWindow().webContents.openDevTools();
        }
      }
    });
  }, []);

  const loadTheme = async () => {
    ipcSend('get-theme').then(setTheme);
  };

  return <ConfigProvider locale={zh_CN}>{children}</ConfigProvider>;
};

export default Base;
