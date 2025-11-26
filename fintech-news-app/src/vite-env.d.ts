/// <reference types="vite/client" />

declare module '*/amplify_outputs.json' {
  const value: {
    version: string;
    data?: {
      url: string;
      aws_region: string;
      default_authorization_type: string;
      api_key: string;
    };
  };
  export default value;
}
