import { app } from 'electron';

export function setAutoStartup(flag: boolean) {
  if (!app.isPackaged) return;
  try {
    if (flag) {
      app.setLoginItemSettings({
        openAtLogin: flag,
        path: process.execPath,
      });
    } else {
      app.setLoginItemSettings({ openAtLogin: flag });
    }
  } catch (e) {
    console.log('设置开机启动失败');
  }
}
