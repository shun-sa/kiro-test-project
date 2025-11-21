import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// aws-exports.jsが存在しない場合にフォールバックを提供するプラグイン
function awsExportsFallback(): Plugin {
  const awsExportsPath = path.resolve(__dirname, './src/aws-exports.js')
  const virtualModuleId = 'virtual:aws-exports'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const defaultAwsConfig = `
    const awsmobile = {
      aws_project_region: 'ap-northeast-1',
      aws_appsync_graphqlEndpoint: '',
      aws_appsync_region: 'ap-northeast-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: '',
    };
    export default awsmobile;
  `

  return {
    name: 'aws-exports-fallback',
    resolveId(id) {
      // aws-exports.jsへのインポートを処理
      if (id.includes('aws-exports')) {
        // ファイルが存在する場合は実際のファイルを使用
        if (fs.existsSync(awsExportsPath)) {
          return awsExportsPath
        }
        // 存在しない場合は仮想モジュールを使用
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // デフォルトの空の設定を返す
        return defaultAwsConfig
      }
      // 実際のファイルが存在しない場合もフォールバック
      if (id === awsExportsPath && !fs.existsSync(awsExportsPath)) {
        return defaultAwsConfig
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), awsExportsFallback()],
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
