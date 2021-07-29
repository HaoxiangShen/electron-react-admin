import { ipcMain, IpcMainEvent } from 'electron';
import { logger } from './logger';

interface IIpcHandler {
  (...args: any[]): Promise<any>;
}

export function setIpcReplier(channel: string, handler: IIpcHandler) {
  ipcMain.handle(channel, async (_: IpcMainEvent, ...args: any[]) => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (e) {
      logger.error(e);
      return { success: false, message: e?.hasOwnProperty('message') ? e.message : e };
    }
  });
}

export function setIpcReplierOnce(channel: string, handler: IIpcHandler) {
  ipcMain.handleOnce(channel, async (_: IpcMainEvent, ...args: any[]) => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (e) {
      logger.error(e);
      return { success: false, message: e?.hasOwnProperty('message') ? e.message : e };
    }
  });
}
