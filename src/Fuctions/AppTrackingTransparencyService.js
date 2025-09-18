import { Platform, Alert } from 'react-native';
import { requestTrackingPermission, getTrackingStatus, TrackingStatus } from 'react-native-tracking-transparency';

export const AppTrackingTransparencyService = {
  // Request tracking permission
  requestTrackingPermission: async () => {
    try {
      // Only request on iOS 14.5+
      if (Platform.OS !== 'ios') {
        console.log('ATT: Not iOS, skipping tracking permission request');
        return {
          success: true,
          status: 'not_applicable',
          message: 'Tracking permission not applicable on this platform'
        };
      }

      console.log('=== APP TRACKING TRANSPARENCY REQUEST ===');
      
      // Check current status first
      const currentStatus = await getTrackingStatus();
      console.log('Current tracking status:', currentStatus);
      
      // Use fallback constants if TrackingStatus is not available
      const statusConstants = TrackingStatus || TRACKING_STATUS;
      
      // If already authorized or denied, return current status
      if (currentStatus === statusConstants.authorized || currentStatus === statusConstants.denied) {
        return {
          success: true,
          status: currentStatus,
          message: getStatusMessage(currentStatus)
        };
      }
      
      // Request permission
      const status = await requestTrackingPermission();
      console.log('Tracking permission result:', status);
      
      return {
        success: true,
        status: status,
        message: getStatusMessage(status)
      };
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      return {
        success: false,
        status: 'error',
        message: 'Failed to request tracking permission',
        error: error.message
      };
    }
  },

  // Get current tracking status
  getCurrentStatus: async () => {
    try {
      if (Platform.OS !== 'ios') {
        return {
          success: true,
          status: 'not_applicable',
          message: 'Tracking permission not applicable on this platform'
        };
      }

      const status = await getTrackingStatus();
      return {
        success: true,
        status: status,
        message: getStatusMessage(status)
      };
    } catch (error) {
      console.error('Error getting tracking status:', error);
      return {
        success: false,
        status: 'error',
        message: 'Failed to get tracking status',
        error: error.message
      };
    }
  },

  // Check if tracking is authorized
  isTrackingAuthorized: async () => {
    try {
      const result = await AppTrackingTransparencyService.getCurrentStatus();
      return result.success && result.status === TrackingStatus.authorized;
    } catch (error) {
      console.error('Error checking tracking authorization:', error);
      return false;
    }
  },

  // Show tracking permission explanation
  showTrackingExplanation: () => {
    Alert.alert(
      'App Tracking Transparency',
      'This app would like to track you across other apps and websites to provide personalized ads and improve your shopping experience. This helps us show you relevant products and offers.',
      [
        {
          text: 'Learn More',
          onPress: () => {
            // You can add a link to your privacy policy here
            console.log('User wants to learn more about tracking');
          }
        },
        {
          text: 'Not Now',
          style: 'cancel'
        },
        {
          text: 'Allow Tracking',
          onPress: () => {
            AppTrackingTransparencyService.requestTrackingPermission();
          }
        }
      ]
    );
  }
};

// Helper function to get user-friendly status messages
const getStatusMessage = (status) => {
  switch (status) {
    case TrackingStatus.authorized:
      return 'Tracking is authorized';
    case TrackingStatus.denied:
      return 'Tracking is denied';
    case TrackingStatus.restricted:
      return 'Tracking is restricted';
    case TrackingStatus.notDetermined:
      return 'Tracking permission not determined';
    case 'not_applicable':
      return 'Tracking permission not applicable on this platform';
    case 'error':
      return 'Error occurred while checking tracking status';
    default:
      return 'Unknown tracking status';
  }
};

export default AppTrackingTransparencyService;





