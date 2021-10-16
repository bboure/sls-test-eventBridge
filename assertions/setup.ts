import * as asserts from './assertions';

if (expect !== undefined) {
  expect.extend(asserts);
} else {
  /* eslint-disable no-console */
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-extended correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
  /* eslint-enable no-console */
}
