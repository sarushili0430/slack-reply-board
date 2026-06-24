import { MacosKeychainSlackTokenStore } from '@replyboard/adapters-keychain';
import { SqliteMessageRepository } from '@replyboard/adapters-sqlite';

export type CompositionRootOptions = {
  readonly databasePath?: string;
};

export type CompositionRoot = {
  readonly messageRepository: SqliteMessageRepository;
  readonly slackTokenStore: MacosKeychainSlackTokenStore;
  dispose(): Promise<void>;
};

export function createCompositionRoot(options: CompositionRootOptions = {}): CompositionRoot {
  const messageRepository = new SqliteMessageRepository({
    databasePath: options.databasePath ?? 'data/slack-reply-board.sqlite',
  });
  const slackTokenStore = new MacosKeychainSlackTokenStore();

  return {
    messageRepository,
    slackTokenStore,
    dispose(): Promise<void> {
      messageRepository.close();
      return Promise.resolve();
    },
  };
}
