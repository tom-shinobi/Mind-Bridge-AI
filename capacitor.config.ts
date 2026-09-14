import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.mindbridge.horizon',
  appName: 'Horizon AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
