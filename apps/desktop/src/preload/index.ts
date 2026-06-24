import { contextBridge, ipcRenderer } from 'electron';

import { createReplyboardPreloadApi } from './replyboard-api.js';

contextBridge.exposeInMainWorld('replyBoard', createReplyboardPreloadApi(ipcRenderer));
