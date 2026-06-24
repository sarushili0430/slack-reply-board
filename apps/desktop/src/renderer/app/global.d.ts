export {};

declare global {
  interface Window {
    readonly replyBoard: {
      getAppVersion(): Promise<string>;
    };
  }
}
