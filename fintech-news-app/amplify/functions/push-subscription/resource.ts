import { defineFunction } from '@aws-amplify/backend';

export const pushSubscription = defineFunction({
  name: 'push-subscription',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
