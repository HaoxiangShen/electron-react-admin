import { app } from 'electron';
import { Application } from './app';
import { logger } from './utils/logger';

logger.info('应用启动');

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('wm-window-animations-disabled');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    const application = new Application();
    application.run();
  });
}

process.on('uncaughtException', err => {
  logger.error('未处理的错误：', err);
});

process.on('unhandledRejection', err => {
  logger.error('未处理的promise：', err);
});
