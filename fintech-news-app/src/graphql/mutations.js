/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createArticle = /* GraphQL */ `
  mutation CreateArticle(
    $input: CreateArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    createArticle(input: $input, condition: $condition) {
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
export const updateArticle = /* GraphQL */ `
  mutation UpdateArticle(
    $input: UpdateArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    updateArticle(input: $input, condition: $condition) {
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
export const deleteArticle = /* GraphQL */ `
  mutation DeleteArticle(
    $input: DeleteArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    deleteArticle(input: $input, condition: $condition) {
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
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $input: CreateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    createCategory(input: $input, condition: $condition) {
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
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    updateCategory(input: $input, condition: $condition) {
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
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
    $input: DeleteCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    deleteCategory(input: $input, condition: $condition) {
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
export const createPushSubscription = /* GraphQL */ `
  mutation CreatePushSubscription(
    $input: CreatePushSubscriptionInput!
    $condition: ModelPushSubscriptionConditionInput
  ) {
    createPushSubscription(input: $input, condition: $condition) {
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
export const updatePushSubscription = /* GraphQL */ `
  mutation UpdatePushSubscription(
    $input: UpdatePushSubscriptionInput!
    $condition: ModelPushSubscriptionConditionInput
  ) {
    updatePushSubscription(input: $input, condition: $condition) {
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
export const deletePushSubscription = /* GraphQL */ `
  mutation DeletePushSubscription(
    $input: DeletePushSubscriptionInput!
    $condition: ModelPushSubscriptionConditionInput
  ) {
    deletePushSubscription(input: $input, condition: $condition) {
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
