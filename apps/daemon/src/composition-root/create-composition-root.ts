import { SqliteMessageRepository } from '@replyboard/adapters-sqlite';

export type CompositionRootOptions = {
  readonly databasePath?: string;
};

export type CompositionRoot = {
  readonly messageRepository: SqliteMessageRepository;
  dispose(): Promise<void>;
};

export function createCompositionRoot(options: CompositionRootOptions = {}): CompositionRoot {
  const messageRepository = new SqliteMessageRepository({
    databasePath: options.databasePath ?? 'data/slack-reply-board.sqlite',
  });

  return {
    messageRepository,
    dispose(): Promise<void> {
      messageRepository.close();
      return Promise.resolve();
    },
  };
}
