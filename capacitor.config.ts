import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nocap.ai',
  appName: 'NoCap AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'nocap-ai.com',
    allowNavigation: [
      'nocap-ai.com',
      '*.nocap-ai.com',
      'bhttzmtvjvvgunjeqahp.supabase.co',
      '*.supabase.co',
      'stripe.com',
      '*.stripe.com'
    ]
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
