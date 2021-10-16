import { eventBridgeSpy } from '../assertions/eventBridge';
import { EventBridge } from 'aws-sdk';
import * as cdk from '@aws-cdk/core';
import { EventBridgeObserver } from '../eventBridgeObserver';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

const eventBridge = new EventBridge({ region: 'us-east-1' });

describe('eventBridge', () => {
  let spy;

  beforeAll(async () => {
    const app = new cdk.App();
    const stack = new EventBridgeObserver(app, 'EventBridgeObserver');
    const synth = app.synth().getStackByName(stack.stackName);
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults();

    const cloudFormation = new CloudFormationDeployments({
      sdkProvider: sdkProvider,
    });
    const deployResult = await cloudFormation.deployStack({
      quiet: true,
      stack: synth,
    });

    spy = eventBridgeSpy({
      url: deployResult.outputs.AppSyncEndpoint,
      apiKey: deployResult.outputs.AppSyncApiKey,
    });
  }, 60000);

  afterEach(() => {
    spy.clear();
  });

  afterAll(() => {
    spy.reset();
  });

  it('should receive an event', async () => {
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

    await expect(spy).toHaveReceivedEvents();
  }, 10000);

  it('should not receive an event', async () => {
    await expect(spy).not.toHaveReceivedEvents();
  }, 10000);

  it('should receive an event [test should fail]', async () => {
    await expect(spy).toHaveReceivedEvents();
  }, 10000);

  it('should not receive an event [test should fail]', async () => {
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
    await expect(spy).not.toHaveReceivedEvents();
  }, 10000);

  it('should receive an event with detail type somethingHappened', async () => {
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
  }, 10000);

  it('should receive an event with detail type somethingHappened [test should fail]', async () => {
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
  }, 10000);

  it('should have received 2 events', async () => {
    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: 'jest',
            DetailType: 'somethingHappened1',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
          {
            Source: 'jest',
            DetailType: 'somethingElseHappened2',
            Detail: JSON.stringify({ foo: 'bar' }),
          },
        ],
      })
      .promise();

    await expect(spy).tohaveReceivedEventsTimes(2);
  }, 10000);
});
