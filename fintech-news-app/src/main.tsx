import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Amplify設定（Backend環境が接続されている場合のみ）
async function configureAmplify() {
  try {
    // @ts-expect-error - AWS Amplify auto-generated file
    const { default: awsconfig } = await import('./aws-exports');
    
    // Endpointが設定されている場合のみAmplifyを設定
    if (awsconfig.aws_appsync_graphqlEndpoint) {
      const { Amplify } = await import('aws-amplify');
      Amplify.configure(awsconfig);
      console.log('✅ Amplify Backend connected');
    } else {
      console.log('ℹ️ Amplify Backend not configured, using mock API');
    }
  } catch {
    console.log('ℹ️ Amplify Backend not connected, using mock API');
  }
}

// モックAPIの初期化
// 環境変数が明示的に'false'の場合のみモックを無効化
async function enableMocking() {
  const useMockApi = import.meta.env.VITE_USE_MOCK_API;

  // 環境変数が明示的に'false'の場合のみモックを無効化
  if (useMockApi === 'false') {
    return;
  }

  // それ以外（未設定または'true'）の場合はモックAPIを有効化
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

// 初期化
Promise.all([configureAmplify(), enableMocking()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
