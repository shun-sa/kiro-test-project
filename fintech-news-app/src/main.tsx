import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// @ts-expect-error - AWS Amplify auto-generated file
import awsconfig from './aws-exports.js';

// Amplify設定（Backend環境が接続されている場合のみ）
async function configureAmplify() {
  try {
    // Endpointが設定されている場合のみAmplifyを設定
    if (awsconfig?.aws_appsync_graphqlEndpoint) {
      const { Amplify } = await import('aws-amplify');
      Amplify.configure(awsconfig);
      console.log('✅ Amplify Backend connected');
    } else {
      console.log('ℹ️ Amplify Backend not configured, using mock API');
    }
  } catch (error) {
    console.log('ℹ️ Amplify Backend not connected, using mock API', error);
  }
}

// モックAPIの初期化
// 環境変数が明示的に'false'の場合のみモックを無効化
async function enableMocking() {
  const useMockApi = import.meta.env.VITE_USE_MOCK_API;

  // 環境変数が明示的に'false'の場合のみモックを無効化
  if (useMockApi === 'false') {
    console.log('ℹ️ Mock API disabled by environment variable');
    return;
  }

  // 本番環境（production）では、Amplify Backendが設定されている場合はモックを無効化
  if (import.meta.env.PROD && awsconfig?.aws_appsync_graphqlEndpoint) {
    console.log('ℹ️ Production mode with Amplify Backend, skipping mock API');
    return;
  }

  // それ以外（開発環境または未設定）の場合はモックAPIを有効化
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
    console.log('✅ Mock API enabled');
  } catch (error) {
    console.warn('⚠️ Failed to start Mock Service Worker:', error);
    console.log('ℹ️ Continuing without mock API');
  }
}

// 初期化
Promise.all([configureAmplify(), enableMocking()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
