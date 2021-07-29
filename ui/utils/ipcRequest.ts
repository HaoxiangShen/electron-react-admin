import { ipcRenderer } from 'electron';

interface IIpcReply {
  success: boolean;
  message?: string;
  data?: any;
}

export async function ipcSend(channel: string, ...reqArgs: any[]): Promise<any> {
  return new Promise(async (resolve, reject) => {
    if (!ipcRenderer) {
      resolve({});
    } else {
      const res: IIpcReply = await ipcRenderer.invoke(channel, ...reqArgs);
      res.success ? resolve(res.data) : reject(res.message);
    }
  });
}
