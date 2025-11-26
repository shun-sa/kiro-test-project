import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Amplify設定（Backend環境が接続されている場合のみ）
async function configureAmplify() {
  try {
    const { Amplify } = await import('aws-amplify');
    const outputs = await import('../amplify_outputs.json');
    
    Amplify.configure(outputs.default);
    console.log('✅ Amplify Backend connected');
  } catch (error) {
    console.log('ℹ️ Amplify Backend not configured, using mock API', error);
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
  if (import.meta.env.PROD) {
    try {
      await import('../amplify_outputs.json');
      console.log('ℹ️ Production mode with Amplify Backend, skipping mock API');
      return;
    } catch {
      // amplify_outputs.jsonが存在しない場合はモックAPIを使用
    }
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
