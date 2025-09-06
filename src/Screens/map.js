import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { TEXT_STYLES, BUTTON_STYLES, COLORS, SPACING, BORDER_RADIUS } from '../styles/globalStyles';

const MapLocation = () => {
  const navigation = useNavigation();
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 13.0827, // Chennai, India
    longitude: 80.2707,
  });
  const [region, setRegion] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  // Default locations for EC Services
  const defaultLocations = [
    {
      id: 1,
      name: 'Chennai Central',
      coordinate: { latitude: 13.0827, longitude: 80.2707 },
      description: 'Main service area - Chennai Central',
    },
    {
      id: 2,
      name: 'Anna Nagar',
      coordinate: { latitude: 13.0843, longitude: 80.2205 },
      description: 'Service area - Anna Nagar',
    },
    {
      id: 3,
      name: 'T. Nagar',
      coordinate: { latitude: 13.0418, longitude: 80.2341 },
      description: 'Service area - T. Nagar',
    },
    {
      id: 4,
      name: 'Velachery',
      coordinate: { latitude: 12.9816, longitude: 80.2204 },
      description: 'Service area - Velachery',
    },
  ];

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'EC Services needs to access your location to provide better service',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            },
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermission(true);
            getCurrentLocation();
          } else {
            setLocationPermission(false);
            Alert.alert(
              'Location Permission',
              'Location access is required for better service. You can still use the map to select a location manually.',
              [{ text: 'OK' }]
            );
          }
        } catch (err) {
          console.warn('Permission request error:', err);
          setLocationPermission(false);
        }
      } else {
        setLocationPermission(true);
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newCoord = { latitude, longitude };
        setMarkerCoord(newCoord);
        setRegion({
          ...newCoord,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      },
      error => {
        console.error('Error getting location:', error);
        setLoading(false);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please select a location manually on the map.',
          [{ text: 'OK' }]
        );
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      },
    );
  };

  const handleMapPress = (e) => {
    setMarkerCoord(e.nativeEvent.coordinate);
  };

  const handleLocationSelect = () => {
    navigation.navigate({
      name: 'AddAddress',
      params: { 
        selectedLocation: markerCoord,
        locationName: 'Selected Location',
        address: `${markerCoord.latitude.toFixed(6)}, ${markerCoord.longitude.toFixed(6)}`
      },
      merge: true,
    });
  };

  const handleCurrentLocation = () => {
    if (locationPermission) {
      getCurrentLocation();
    } else {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permission in settings to use this feature.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        onRegionChangeComplete={setRegion}
      >
        {/* User selected marker */}
        <Marker
          coordinate={markerCoord}
          title="Selected Location"
          description="Tap anywhere on map to change location"
          draggable
          pinColor={COLORS.primary}
        />
        
        {/* Service area markers */}
        {defaultLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location.coordinate}
            title={location.name}
            description={location.description}
            pinColor={COLORS.accent}
          />
        ))}
      </MapView>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* Location info */}
      <View style={styles.locationInfo}>
        <Text style={styles.coordText}>
          Selected: {markerCoord.latitude.toFixed(6)}, {markerCoord.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.currentLocationButton]}
          onPress={handleCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>📍 Current Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.selectButton]}
          onPress={handleLocationSelect}
        >
          <Text style={styles.selectButtonText}>✓ Select This Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  locationInfo: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  coordText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  currentLocationButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.primary,
  },
  selectButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.white,
  },
});
