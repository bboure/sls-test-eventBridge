import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { Observable } from 'apollo-client/util/Observable';
import { AWSAppSyncClient, AUTH_TYPE } from 'aws-appsync';
import { EventBridgeEvent } from 'aws-lambda';
import gql from 'graphql-tag';
import 'isomorphic-fetch';
import ws from 'ws';
global.WebSocket = ws as any;

const query = gql`
  subscription Subscribe {
    subscribe {
      id
      version
      detailType
      source
      account
      time
      region
      resources
      detail
    }
  }
`;

// TODO: add filters??
type Params = {
  url: string;
  apiKey: string;
  timeout?: number;
};

type EventMatcher = (event: EventBridgeEvent<string, any>[]) => boolean | null;

export type EventBridgeSpy = {
  events: EventBridgeEvent<string, any>[];
  awaitEvents: (
    matcher: EventMatcher,
  ) => Promise<EventBridgeEvent<string, any>[]>;
  clear: () => void;
  reset: () => void;
};

export const eventBridgeSpy = (params: Params) => {
  const { url, apiKey, timeout = 2000 } = params;

  return new (class {
    events: EventBridgeEvent<string, any>[] = [];
    client: AWSAppSyncClient<NormalizedCacheObject>;
    observable: Observable<any>;
    subscription: ZenObservable.Subscription;

    constructor() {
      const client = new AWSAppSyncClient({
        url,
        region: 'us-east-1',
        auth: {
          type: AUTH_TYPE.API_KEY,
          apiKey,
        },
        disableOffline: true,
      });

      this.observable = client.subscribe({ query });
      this.subscription = this.observable.subscribe({
        next: (response) => {
          const subEvent = response.data.subscribe;
          const event: EventBridgeEvent<string, any> = {
            id: subEvent.id,
            version: subEvent.version,
            account: subEvent.account,
            time: subEvent.time,
            region: subEvent.region,
            resources: subEvent.resources,
            source: subEvent.source,
            'detail-type': subEvent.detailType,
            detail: JSON.parse(subEvent.detail),
          };

          this.events.push(event);
        },
        start: console.log,
        error: (error) => {
          throw new Error(error);
        },
      });
    }

    clear() {
      this.events = [];
    }

    reset() {
      this.events = [];
      this.subscription.unsubscribe();
    }

    awaitEvents(matcher) {
      return new Promise<EventBridgeEvent<string, any>[]>((resolve) => {
        const timer = setTimeout(() => {
          sub.unsubscribe();
          resolve(this.events);
        }, timeout);
        const sub = this.observable.subscribe({
          next: (response) => {
            if (matcher(this.events)) {
              sub.unsubscribe();
              clearTimeout(timer);
              resolve(this.events);
            }
          },
        });
      });
    }
  })();
};
