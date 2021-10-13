# Test Event-driven applications with Jest

This is a POC for a framework testing EventDriven applications with Jest.
It leverages AppSync subscriptions to subscribe to events and implement assertion helpers.

Also see [this repo](https://github.com/bboure/appsync-eventbridge-subscriber)
for the AppSync part of this.

# How it works

It leverages AppSync to subscribe to EventBridge Events.
First, create an EventBridge spy.
Then, execute the system under test.
Finally, assert on the spy;

```ts
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
```

As soon as the event is received, AppSync will resolve a promise and the assertion will take place.
If no event is received, the promise will time out (configurable) and the assertion will assume that no event is received.

# Assertions

## `toReceiveEvent`

Tests that any event was received

## `toReceiveEventWithDetailType`

Tests taht an event with a given detail-type was received
