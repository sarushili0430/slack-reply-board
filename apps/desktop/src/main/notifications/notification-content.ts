export type NotificationContentInput = {
  readonly title: string;
  readonly slackMessageBody: string;
  readonly showSlackMessageBody: boolean;
};

export type NotificationContent = {
  readonly title: string;
  readonly body: string;
};

const privateSlackActivityBody = 'New Slack activity needs your attention.';

export function buildNotificationContent(input: NotificationContentInput): NotificationContent {
  return {
    title: input.title,
    body: input.showSlackMessageBody ? input.slackMessageBody : privateSlackActivityBody,
  };
}
