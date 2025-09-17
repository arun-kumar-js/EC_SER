module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './src/Assets/fonts/',
    './src/Assets/icon/',
    './src/Assets/Images/',
  ],
  dependencies: {
    "react-native-pusher-push-notifications": {
      platforms: {
        android: null // this skips autolink for android
      }
    }
  }
};
