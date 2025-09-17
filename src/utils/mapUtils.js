import { Platform } from 'react-native';
import { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

/**
 * Get the appropriate map provider based on the platform
 * @returns {string} The map provider constant
 */
export const getMapProvider = () => {
  return Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE;
};

/**
 * Get map provider name for debugging/logging
 * @returns {string} Human-readable provider name
 */
export const getMapProviderName = () => {
  return Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps';
};

/**
 * Check if the current platform supports the specified map features
 * @param {string} feature - The feature to check (e.g., 'traffic', 'satellite', 'terrain')
 * @returns {boolean} Whether the feature is supported
 */
export const isMapFeatureSupported = (feature) => {
  const supportedFeatures = {
    ios: ['traffic', 'satellite', 'standard', 'hybrid'],
    android: ['traffic', 'satellite', 'standard', 'hybrid', 'terrain']
  };
  
  return supportedFeatures[Platform.OS]?.includes(feature) || false;
};

/**
 * Get default map configuration based on platform
 * @returns {object} Default map configuration
 */
export const getDefaultMapConfig = () => {
  return {
    provider: getMapProvider(),
    mapType: 'standard',
    showsUserLocation: true,
    showsMyLocationButton: true,
    showsCompass: true,
    showsScale: true,
    // Platform-specific optimizations
    ...(Platform.OS === 'ios' && {
      // iOS-specific settings
      userLocationPriority: 'high',
    }),
    ...(Platform.OS === 'android' && {
      // Android-specific settings
      loadingEnabled: true,
    }),
  };
};


