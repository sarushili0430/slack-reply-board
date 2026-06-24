# 016 Notification Privacy

## Functional Requirements

### FR-DESKTOP-002 Notification body privacy

The desktop app must make Slack message body exposure in OS notifications configurable.

### AC-DESKTOP-002-01 Slack body hidden by default

Given:

- A Slack-backed card update is ready to notify the user.
- Notification body previews are disabled.

When:

- The desktop app builds the OS notification content.

Then:

- The notification title is shown.
- The Slack message body is not included.
- The notification body uses a generic private preview.

### AC-DESKTOP-002-02 Slack body can be enabled explicitly

Given:

- A Slack-backed card update is ready to notify the user.
- Notification body previews are enabled by user settings.

When:

- The desktop app builds the OS notification content.

Then:

- The notification may include the Slack message body.

## Security Impact

- The default prevents Slack content from appearing on the OS lock screen or notification center.
- Enabling previews is an explicit user setting.
