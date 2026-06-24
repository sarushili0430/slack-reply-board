import {
  completeSlackOAuthRequestSchema,
  slackMessageDeletionEventSchema,
  slackMessageEventSchema,
  type CompleteSlackOAuthRequestContract,
  type SlackMessageDeletionEventContract,
  type SlackMessageEventContract,
} from '@replyboard/contracts';
import { z } from 'zod';

const slackOAuthTokenUrl = 'https://slack.com/api/oauth.v2.access';

const slackEventCallbackSchema = z.object({
  type: z.literal('event_callback'),
  event_id: z.string().min(1),
  team_id: z.string().min(1),
  event_time: z.number().int().nonnegative(),
  event: z.object({
    type: z.literal('message'),
    channel: z.string().min(1),
    ts: z.string().min(1),
    thread_ts: z.string().min(1).optional(),
    text: z.string().default(''),
  }),
});

const slackMessageDeletedEventCallbackSchema = z.object({
  type: z.literal('event_callback'),
  event_id: z.string().min(1),
  team_id: z.string().min(1),
  event_time: z.number().int().nonnegative(),
  event: z.object({
    type: z.literal('message'),
    subtype: z.literal('message_deleted'),
    channel: z.string().min(1),
    deleted_ts: z.string().min(1),
  }),
});

const slackOAuthCodeExchangeInputSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  code: z.string().min(1),
  redirectUri: z.url().optional(),
});

const slackOAuthSuccessResponseSchema = z
  .object({
    ok: z.literal(true),
    access_token: z.string().min(1),
    team: z.object({
      id: z.string().min(1),
    }),
  })
  .loose();

const slackOAuthFailureResponseSchema = z
  .object({
    ok: z.literal(false),
    error: z.string().min(1).optional(),
  })
  .loose();

const slackOAuthResponseSchema = z.union([
  slackOAuthSuccessResponseSchema,
  slackOAuthFailureResponseSchema,
]);

export type SlackOAuthCodeExchangeInput = z.infer<typeof slackOAuthCodeExchangeInputSchema>;

export type SlackOAuthExchangeFetchInit = {
  readonly method: 'POST';
  readonly headers: Record<string, string>;
  readonly body: URLSearchParams;
};

export type SlackOAuthExchangeFetchResponse = {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
};

export type SlackOAuthExchangeFetch = (
  url: string,
  init: SlackOAuthExchangeFetchInit,
) => Promise<SlackOAuthExchangeFetchResponse>;

export type SlackOAuthCodeExchangeClientOptions = {
  readonly fetch?: SlackOAuthExchangeFetch;
  readonly tokenUrl?: string;
};

export class SlackOAuthCodeExchangeClient {
  readonly #fetch: SlackOAuthExchangeFetch;
  readonly #tokenUrl: string;

  constructor(options: SlackOAuthCodeExchangeClientOptions = {}) {
    this.#fetch = options.fetch ?? defaultSlackOAuthFetch;
    this.#tokenUrl = options.tokenUrl ?? slackOAuthTokenUrl;
  }

  async exchangeCode(
    input: SlackOAuthCodeExchangeInput,
  ): Promise<CompleteSlackOAuthRequestContract> {
    const request = slackOAuthCodeExchangeInputSchema.parse(input);
    const response = await this.#fetch(this.#tokenUrl, {
      body: createSlackOAuthFormData(request),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Slack OAuth exchange failed with HTTP ${String(response.status)}.`);
    }

    const parsed = slackOAuthResponseSchema.parse(await response.json());

    if (!parsed.ok) {
      throw new Error(`Slack OAuth exchange failed: ${parsed.error ?? 'unknown_error'}`);
    }

    return completeSlackOAuthRequestSchema.parse({
      accessToken: parsed.access_token,
      workspaceId: parsed.team.id,
    });
  }
}

function createSlackOAuthFormData(input: SlackOAuthCodeExchangeInput): URLSearchParams {
  const body = new URLSearchParams();

  body.set('client_id', input.clientId);
  body.set('client_secret', input.clientSecret);
  body.set('code', input.code);

  if (input.redirectUri !== undefined) {
    body.set('redirect_uri', input.redirectUri);
  }

  return body;
}

const defaultSlackOAuthFetch: SlackOAuthExchangeFetch = async (url, init) => {
  const response = await fetch(url, init);

  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json(),
  };
};

export function parseSlackMessageEvent(payload: unknown): SlackMessageEventContract {
  return slackMessageEventSchema.parse(payload);
}

export function parseSlackMessageDeletionEvent(
  payload: unknown,
): SlackMessageDeletionEventContract {
  return slackMessageDeletionEventSchema.parse(payload);
}

export function mapSlackEventCallbackToMessageEvent(payload: unknown): SlackMessageEventContract {
  const parsed = slackEventCallbackSchema.parse(payload);
  const event = {
    eventId: parsed.event_id,
    workspaceId: parsed.team_id,
    channelId: parsed.event.channel,
    messageTs: parsed.event.ts,
    text: parsed.event.text,
    eventTime: new Date(parsed.event_time * 1000).toISOString(),
  };

  if (parsed.event.thread_ts === undefined) {
    return parseSlackMessageEvent(event);
  }

  return parseSlackMessageEvent({
    ...event,
    threadTs: parsed.event.thread_ts,
  });
}

export function mapSlackEventCallbackToMessageDeletionEvent(
  payload: unknown,
): SlackMessageDeletionEventContract {
  const parsed = slackMessageDeletedEventCallbackSchema.parse(payload);

  return parseSlackMessageDeletionEvent({
    eventId: parsed.event_id,
    workspaceId: parsed.team_id,
    channelId: parsed.event.channel,
    messageTs: parsed.event.deleted_ts,
    eventTime: new Date(parsed.event_time * 1000).toISOString(),
  });
}
