import { describe, expect, test } from 'vitest';

import { buildNotificationContent } from './notification-content.js';

describe('FR-DESKTOP-002 Notification body privacy', () => {
  test('TEST-DESKTOP-UNIT-002 / AC-DESKTOP-002-01 / AC-DESKTOP-002-02: OS通知のSlack本文表示は設定で制御する', () => {
    const messageBody = '顧客のSlack本文をロック画面に出さない';

    const hiddenContent = buildNotificationContent({
      title: 'Needs reply',
      slackMessageBody: messageBody,
      showSlackMessageBody: false,
    });
    const visibleContent = buildNotificationContent({
      title: 'Needs reply',
      slackMessageBody: messageBody,
      showSlackMessageBody: true,
    });

    expect(hiddenContent).toEqual({
      title: 'Needs reply',
      body: 'New Slack activity needs your attention.',
    });
    expect(hiddenContent.body).not.toContain(messageBody);
    expect(visibleContent).toEqual({
      title: 'Needs reply',
      body: messageBody,
    });
  });
});
