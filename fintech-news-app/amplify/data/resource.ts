import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Article: a
    .model({
      title: a.string().required(),
      summary: a.string().required(),
      content: a.string().required(),
      url: a.string().required(),
      imageUrl: a.string(),
      publishedAt: a.string().required(),
      source: a.string().required(),
      category: a.string().required(),
      techLevel: a.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
      readingTime: a.integer().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Category: a
    .model({
      name: a.string().required(),
      slug: a.string().required(),
      color: a.string().required(),
      icon: a.string().required(),
      description: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
