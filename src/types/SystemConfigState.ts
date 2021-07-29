export interface SystemConfigState {
  autostart: boolean; // 是否开机自启动
  autoUpdate: boolean; // 是否自动检查更新
  autologin: boolean;
  closeWindow: CloseType; // 点击关闭是否退出
}

export enum CloseType {
  最小化到系统托盘 = 1,
  退出 = 2,
}
