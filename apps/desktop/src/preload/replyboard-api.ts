export type ReplyboardPreloadIpc = {
  invoke(channel: 'app:get-version'): Promise<unknown>;
};

export type ReplyboardPreloadApi = {
  getAppVersion(): Promise<string>;
};

export function createReplyboardPreloadApi(ipc: ReplyboardPreloadIpc): ReplyboardPreloadApi {
  return {
    async getAppVersion(): Promise<string> {
      const version = await ipc.invoke('app:get-version');

      if (typeof version !== 'string') {
        throw new Error('app:get-version returned a non-string value.');
      }

      return version;
    },
  };
}
