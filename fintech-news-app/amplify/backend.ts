import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { newsFetcher } from './functions/news-fetcher/resource';
import { pushSubscription } from './functions/push-subscription/resource';
import { pushSender } from './functions/push-sender/resource';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  data,
  newsFetcher,
  pushSubscription,
  pushSender,
});

// PushSubscriptionsテーブルを作成
const pushSubscriptionsTable = new Table(backend.stack, 'PushSubscriptions', {
  partitionKey: { name: 'userId', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  tableName: 'PushSubscriptions',
});

// EventBridgeスケジューラーを設定（15分毎に実行）
const eventRule = new Rule(backend.stack, 'NewsFetcherSchedule', {
  schedule: Schedule.rate(Duration.minutes(15)),
});

eventRule.addTarget(new LambdaFunction(backend.newsFetcher.resources.lambda));

// news-fetcher Lambda関数の設定
backend.newsFetcher.addEnvironment(
  'ARTICLE_TABLE_NAME',
  backend.data.resources.tables['Article'].tableName
);

backend.data.resources.tables['Article'].grantWriteData(
  backend.newsFetcher.resources.lambda
);

// push-subscription Lambda関数の設定
backend.pushSubscription.addEnvironment(
  'PUSH_SUBSCRIPTIONS_TABLE_NAME',
  pushSubscriptionsTable.tableName
);

pushSubscriptionsTable.grantReadWriteData(backend.pushSubscription.resources.lambda);

// push-sender Lambda関数の設定
backend.pushSender.addEnvironment(
  'PUSH_SUBSCRIPTIONS_TABLE_NAME',
  pushSubscriptionsTable.tableName
);

pushSubscriptionsTable.grantReadWriteData(backend.pushSender.resources.lambda);
backend.data.resources.tables['Article'].grantReadData(
  backend.pushSender.resources.lambda
);
