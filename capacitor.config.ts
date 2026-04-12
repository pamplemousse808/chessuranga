import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chessuranga.app',
  appName: 'Chessuranga',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#06080f',
      showSpinner: false,
    }
  }
};

export default config;