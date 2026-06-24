import type { BoardCardSummaryContract } from '@replyboard/contracts';
import type { JSX } from 'react';

const demoCards: readonly BoardCardSummaryContract[] = [
  {
    id: 'card-1',
    status: 'needs_me',
    channelIdHash: 'sha256:channel',
    title: 'Project A release schedule confirmation',
    updatedAt: '2026-06-23T10:00:00.000Z',
  },
  {
    id: 'card-2',
    status: 'draft_ready',
    channelIdHash: 'sha256:channel',
    title: 'Draft response for onboarding request',
    updatedAt: '2026-06-23T11:00:00.000Z',
  },
];

export function App(): JSX.Element {
  return (
    <main className="shell" data-testid="reply-board-ready">
      <aside className="sidebar" aria-label="Board navigation">
        <h1>Reply Board</h1>
        <nav>
          <a href="#board">Board</a>
          <a href="#knowledge">Knowledge</a>
          <a href="#activity">Activity</a>
          <a href="#settings">Settings</a>
        </nav>
      </aside>
      <section className="workspace" id="board" aria-label="Reply board">
        <header className="toolbar">
          <div>
            <p className="eyebrow">Slack Inbox</p>
            <h2>Needs review</h2>
          </div>
          <button type="button">Sync</button>
        </header>
        <div className="board-grid">
          {demoCards.map((card) => (
            <article className="card" key={card.id}>
              <span className={`status status-${card.status}`}>{card.status}</span>
              <h3>{card.title}</h3>
              <p>{card.channelIdHash}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
