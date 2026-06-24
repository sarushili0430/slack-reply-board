export type TokenReference = {
  readonly workspaceIdHash: string;
  readonly keychainAccount: string;
};

export type KeychainCredentialEntry = {
  setPassword(password: string): Promise<void> | void;
  getPassword(): Promise<string | null | undefined> | string | null | undefined;
  deleteCredential(): Promise<boolean> | boolean;
};

export type KeychainEntryFactory = (
  serviceName: string,
  accountName: string,
) => Promise<KeychainCredentialEntry> | KeychainCredentialEntry;

export type MacosKeychainSlackTokenStoreOptions = {
  readonly serviceName?: string;
  readonly createEntry?: KeychainEntryFactory;
};

const defaultSlackTokenServiceName = 'slack-reply-board/slack-token';

export function createTokenReference(
  workspaceIdHash: string,
  keychainAccount: string,
): TokenReference {
  return {
    workspaceIdHash,
    keychainAccount,
  };
}

export class MacosKeychainSlackTokenStore {
  readonly #serviceName: string;
  readonly #createEntry: KeychainEntryFactory;

  constructor(options: MacosKeychainSlackTokenStoreOptions = {}) {
    this.#serviceName = options.serviceName ?? defaultSlackTokenServiceName;
    this.#createEntry = options.createEntry ?? createNativeKeychainEntry;
  }

  async saveToken(reference: TokenReference, token: string): Promise<void> {
    if (token.length === 0) {
      throw new Error('Slack token must not be empty.');
    }

    const entry = await this.#entryFor(reference);
    await entry.setPassword(token);
  }

  async readToken(reference: TokenReference): Promise<string | null> {
    const entry = await this.#entryFor(reference);
    const password = await entry.getPassword();

    return password ?? null;
  }

  async deleteToken(reference: TokenReference): Promise<boolean> {
    const entry = await this.#entryFor(reference);

    return await entry.deleteCredential();
  }

  async #entryFor(reference: TokenReference): Promise<KeychainCredentialEntry> {
    return await this.#createEntry(this.#serviceName, reference.keychainAccount);
  }
}

async function createNativeKeychainEntry(
  serviceName: string,
  accountName: string,
): Promise<KeychainCredentialEntry> {
  const keyring = await import('@napi-rs/keyring');

  return new keyring.AsyncEntry(serviceName, accountName);
}
