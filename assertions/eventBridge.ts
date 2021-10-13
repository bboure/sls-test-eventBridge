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

export type EventBridgeSpy = {
  promise: Promise<EventBridgeEvent<string, any> | undefined>;
  reset: () => void;
};

export const eventBridgeSpy = (params: Params): EventBridgeSpy => {
  const { url, apiKey, timeout = 10000 } = params;

  const client = new AWSAppSyncClient({
    url,
    region: 'us-east-1',
    auth: {
      type: AUTH_TYPE.API_KEY,
      apiKey,
    },
    disableOffline: true,
  });

  let subscription: ZenObservable.Subscription;
  const promise = new Promise((resolve) => {
    subscription = client.subscribe({ query }).subscribe({
      next: (response) => {
        resolve(response.data.subscribe);
      },
      start: console.log,
      error: (error) => {
        throw new Error(error);
      },
    });
    setTimeout(() => {
      resolve(undefined);
    }, timeout);
  });

  return {
    reset: () => {
      subscription.unsubscribe();
    },
    promise,
  };
};
