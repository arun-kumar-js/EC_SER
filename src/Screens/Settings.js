import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const SettingsScreen = () => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <Text style={styles.placeholderText}>More settings coming soon...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#F40612',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    padding: wp('4%'),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  placeholderText: {
    fontSize: wp('3.5%'),
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Regular',
  },
});

export default SettingsScreen;
