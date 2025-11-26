import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// amplify_outputs.jsonが存在しない場合にフォールバックを提供するプラグイン
function amplifyOutputsFallback(): Plugin {
  const amplifyOutputsPath = path.resolve(__dirname, './amplify_outputs.json')
  const virtualModuleId = 'virtual:amplify-outputs'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const defaultAmplifyConfig = `
    export default {
      version: "1",
      data: {
        url: "",
        aws_region: "ap-northeast-1",
        default_authorization_type: "API_KEY",
        api_key: ""
      }
    };
  `

  return {
    name: 'amplify-outputs-fallback',
    resolveId(id) {
      // amplify_outputs.jsonへのインポートを処理
      if (id.includes('amplify_outputs.json')) {
        // ファイルが存在する場合は実際のファイルを使用
        if (fs.existsSync(amplifyOutputsPath)) {
          return amplifyOutputsPath
        }
        // 存在しない場合は仮想モジュールを使用
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // デフォルトの空の設定を返す
        return defaultAmplifyConfig
      }
      // 実際のファイルが存在しない場合もフォールバック
      if (id === amplifyOutputsPath && !fs.existsSync(amplifyOutputsPath)) {
        return defaultAmplifyConfig
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), amplifyOutputsFallback()],
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
