/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getArticle = /* GraphQL */ `
  query GetArticle($id: ID!) {
    getArticle(id: $id) {
      id
      title
      summary
      content
      url
      imageUrl
      publishedAt
      source
      category
      techLevel
      readingTime
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listArticles = /* GraphQL */ `
  query ListArticles(
    $filter: ModelArticleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArticles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        summary
        content
        url
        imageUrl
        publishedAt
        source
        category
        techLevel
        readingTime
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      name
      slug
      icon
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        slug
        icon
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPushSubscription = /* GraphQL */ `
  query GetPushSubscription($id: ID!) {
    getPushSubscription(id: $id) {
      id
      endpoint
      keys
      userId
      categories
      frequency
      quietHoursEnabled
      quietHoursStart
      quietHoursEnd
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPushSubscriptions = /* GraphQL */ `
  query ListPushSubscriptions(
    $filter: ModelPushSubscriptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPushSubscriptions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        endpoint
        keys
        userId
        categories
        frequency
        quietHoursEnabled
        quietHoursStart
        quietHoursEnd
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
