import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { EventBridgeSpy } from './eventBridge';

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

export const toHaveReceivedEvents = async (
  spy: EventBridgeSpy,
): Promise<AssertionResponse> => {
  await spy.awaitEvents((events) => events.length > 0);

  const count = spy.events.length;
  const pass = count >= 1;
  const message = pass
    ? () =>
        matcherHint('toHaveReceivedEvents', 'events', 'expected') +
        `\n\n` +
        `Expected number of events: ${printExpected(0)}\n` +
        `Received number of events: ${printReceived(count)}`
    : () =>
        matcherHint('toHaveReceivedEvents', 'events', 'expected') +
        '\n\n' +
        `Expected number of events >: ${printExpected(1)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};

export const toReceiveEventWithDetailType = async (
  spy: EventBridgeSpy,
  expected: string,
): Promise<AssertionResponse> => {
  const { events } = spy;

  await spy.awaitEvents((e) => {
    return e.some((event) => event['detail-type'] === expected);
  });

  const pass = events.some((event) => event['detail-type'] === expected);
  const message = pass
    ? () => {
        return (
          matcherHint('toReceiveEventWithDetailType', 'events', 'detail-type') +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          `Number of events: ${printReceived(events.length)}`
        );
      }
    : () => {
        return (
          matcherHint('toReceiveEventWithDetailType', 'events', 'detail-type') +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          (events.length > 0
            ? `Received: ${printReceived(events[0]?.['detail-type'])}`
            : `Number of events: ${printReceived(events.length)}`)
        );
      };

  return { message, pass };
};

export const tohaveReceivedEventsTimes = async (
  spy: EventBridgeSpy,
  expected: number,
): Promise<AssertionResponse> => {
  await spy.awaitEvents((e) => {
    return e.length > expected;
  });

  const count = spy.events.length;
  const pass = count === expected;
  const message = pass
    ? () =>
        matcherHint('tohaveReceivedEventsTimes', 'events', 'expected') +
        `\n\n` +
        `Expected number of events: not ${printExpected(expected)}`
    : () =>
        matcherHint('tohaveReceivedEventsTimes', 'events', 'expected') +
        '\n\n' +
        `Expected number of events: ${printExpected(expected)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};
