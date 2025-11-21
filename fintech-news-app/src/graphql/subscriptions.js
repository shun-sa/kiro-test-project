/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateArticle = /* GraphQL */ `
  subscription OnCreateArticle($filter: ModelSubscriptionArticleFilterInput) {
    onCreateArticle(filter: $filter) {
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
export const onUpdateArticle = /* GraphQL */ `
  subscription OnUpdateArticle($filter: ModelSubscriptionArticleFilterInput) {
    onUpdateArticle(filter: $filter) {
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
export const onDeleteArticle = /* GraphQL */ `
  subscription OnDeleteArticle($filter: ModelSubscriptionArticleFilterInput) {
    onDeleteArticle(filter: $filter) {
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
export const onCreateCategory = /* GraphQL */ `
  subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onCreateCategory(filter: $filter) {
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
export const onUpdateCategory = /* GraphQL */ `
  subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onUpdateCategory(filter: $filter) {
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
export const onDeleteCategory = /* GraphQL */ `
  subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onDeleteCategory(filter: $filter) {
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
export const onCreatePushSubscription = /* GraphQL */ `
  subscription OnCreatePushSubscription(
    $filter: ModelSubscriptionPushSubscriptionFilterInput
  ) {
    onCreatePushSubscription(filter: $filter) {
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
export const onUpdatePushSubscription = /* GraphQL */ `
  subscription OnUpdatePushSubscription(
    $filter: ModelSubscriptionPushSubscriptionFilterInput
  ) {
    onUpdatePushSubscription(filter: $filter) {
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
export const onDeletePushSubscription = /* GraphQL */ `
  subscription OnDeletePushSubscription(
    $filter: ModelSubscriptionPushSubscriptionFilterInput
  ) {
    onDeletePushSubscription(filter: $filter) {
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
