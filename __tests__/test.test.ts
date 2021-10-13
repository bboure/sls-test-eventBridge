import { eventBridgeSpy } from '../assertions/eventBridge';
import { EventBridge } from 'aws-sdk';

const url = ''; // repalce with your API url
const apiKey = ''; // repalce with your API key

const eventBridge = new EventBridge({ region: 'us-east-1' });

describe('eventBridge', () => {
  it('should receive an event', async () => {
    const spy = eventBridgeSpy({ url, apiKey });

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: 'jest',
            DetailType: 'somethingHappened',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
        ],
      })
      .promise();

    await expect(spy).toReceiveEvent();
    spy.reset();
  }, 10000);

  it('should receive an event with detail type', async () => {
    const spy = eventBridgeSpy({ url, apiKey });

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: 'jest',
            DetailType: 'somethingHappened',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
        ],
      })
      .promise();

    await expect(spy).toReceiveEventWithDetailType('somethingHappened');
    spy.reset();
  }, 10000);

  // this should fail
  it('should receive an event with detail type [test should fail]', async () => {
    const spy = eventBridgeSpy({ url, apiKey });

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: 'jest',
            DetailType: 'shitHappens',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
        ],
      })
      .promise();

    await expect(spy).toReceiveEventWithDetailType('somethingHappened');
    spy.reset();
  }, 10000);

  it('should not receive an event', async () => {
    const spy = eventBridgeSpy({ url, apiKey });

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: 'jest',
            DetailType: 'shitHappens',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
        ],
      })
      .promise();

    await expect(spy).not.toReceiveEventWithDetailType('somethingHappened');
    spy.reset();
  }, 10000);
});
