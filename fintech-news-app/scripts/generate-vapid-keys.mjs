/**
 * VAPID鍵を生成するスクリプト
 * 
 * 使用方法:
 * node scripts/generate-vapid-keys.mjs
 */

import webpush from 'web-push';

console.log('Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated successfully!\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('\n');
console.log('Add these to your environment variables:');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:your-email@example.com');
console.log('');
console.log('For Amplify, add these to AWS Systems Manager Parameter Store or Amplify Console environment variables.');
