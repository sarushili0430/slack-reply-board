import { contextBridge, ipcRenderer } from 'electron';

const replyBoardApi = {
  getAppVersion: async (): Promise<string> => {
    return ipcRenderer.invoke('app:get-version') as Promise<string>;
  },
};

contextBridge.exposeInMainWorld('replyBoard', replyBoardApi);
