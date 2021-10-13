import { EventBridgeSpy } from './eventBridge';

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

export const toReceiveEvent = async (
  spy: EventBridgeSpy,
): Promise<AssertionResponse> => {
  const response = await spy.promise;
  return {
    message: () => `Did not receive event`,
    pass: response !== undefined,
  };
};

export const toReceiveEventWithDetailType = async (
  spy: EventBridgeSpy,
  detailType: string,
): Promise<AssertionResponse> => {
  const response = await spy.promise;

  return {
    message: () => `DetailType did not match`,
    pass: response['detailType'] === detailType,
  };
};

if (expect !== undefined) {
  expect.extend({ toReceiveEvent, toReceiveEventWithDetailType });
} else {
  /* eslint-disable no-console */
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-extended correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
  /* eslint-enable no-console */
}
