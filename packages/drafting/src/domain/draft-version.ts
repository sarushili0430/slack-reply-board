export type DraftVersion = {
  readonly draftId: string;
  readonly threadVersion: number;
};

export function canSendDraft(draft: DraftVersion, currentThreadVersion: number): boolean {
  return draft.threadVersion === currentThreadVersion;
}
