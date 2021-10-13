import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
  setupFilesAfterEnv: ['./assertions/setup.ts'],
  verbose: false,
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
};

export default config;
