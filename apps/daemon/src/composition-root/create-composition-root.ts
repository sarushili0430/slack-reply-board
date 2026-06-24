import { SqliteMessageRepository } from '@replyboard/adapters-sqlite';

export type CompositionRoot = {
  readonly messageRepository: SqliteMessageRepository;
  dispose(): Promise<void>;
};

export function createCompositionRoot(): CompositionRoot {
  return {
    messageRepository: new SqliteMessageRepository(),
    dispose(): Promise<void> {
      return Promise.resolve();
    },
  };
}
