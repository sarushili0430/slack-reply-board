export type TokenReference = {
  readonly workspaceIdHash: string;
  readonly keychainAccount: string;
};

export function createTokenReference(
  workspaceIdHash: string,
  keychainAccount: string,
): TokenReference {
  return {
    workspaceIdHash,
    keychainAccount,
  };
}
