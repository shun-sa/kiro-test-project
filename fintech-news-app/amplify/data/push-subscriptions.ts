import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  PushSubscription: a
    .model({
      userId: a.id().required(),
      endpoint: a.string().required(),
      keys: a.json().required(),
      preferences: a.json().required(),
      isActive: a.boolean().required(),
      lastNotified: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type PushSubscriptionSchema = ClientSchema<typeof schema>;

export const pushSubscriptionData = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
