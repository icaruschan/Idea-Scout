import { defineConfig } from '@trigger.dev/sdk/v3';
import { additionalPackages } from '@trigger.dev/build/extensions/core';

export default defineConfig({
  project: 'proj_vhgaozsabmhfnampfijm',
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 14400, // Increase max duration to 4 hours to allow scraping multiple X creators with rate limits (since we wait 5.5s between requests)
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
  build: {
    external: ['proxy-agent'],
    extensions: [
      additionalPackages({
        packages: ['proxy-agent'],
      }),
    ],
  },
});
