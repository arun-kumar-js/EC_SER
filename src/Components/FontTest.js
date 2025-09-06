import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Fonts, FontStyles } from '../Config/Fonts';

const FontTest = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Montserrat Font Test</Text>
      
      {/* Font Styles Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Styles (Recommended)</Text>
        <Text style={FontStyles.h1}>H1 - Bold (32px)</Text>
        <Text style={FontStyles.h2}>H2 - SemiBold (28px)</Text>
        <Text style={FontStyles.h3}>H3 - Medium (24px)</Text>
        <Text style={FontStyles.h4}>H4 - Medium (20px)</Text>
        <Text style={FontStyles.h5}>H5 - Regular (18px)</Text>
        <Text style={FontStyles.h6}>H6 - Regular (16px)</Text>
        <Text style={FontStyles.bodyLarge}>Body Large - Regular (16px)</Text>
        <Text style={FontStyles.bodyMedium}>Body Medium - Regular (14px)</Text>
        <Text style={FontStyles.bodySmall}>Body Small - Regular (12px)</Text>
        <Text style={FontStyles.labelLarge}>Label Large - Medium (14px)</Text>
        <Text style={FontStyles.labelMedium}>Label Medium - Medium (12px)</Text>
        <Text style={FontStyles.labelSmall}>Label Small - Medium (10px)</Text>
        <Text style={FontStyles.caption}>Caption - Regular (12px)</Text>
        <Text style={FontStyles.overline}>Overline - Medium (10px)</Text>
      </View>

      {/* Direct Font Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct Font Family Test</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.thin }]}>Thin (100)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.extraLight }]}>Extra Light (200)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.light }]}>Light (300)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.regular }]}>Regular (400)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.medium }]}>Medium (500)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.semiBold }]}>Semi Bold (600)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.bold }]}>Bold (700)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.extraBold }]}>Extra Bold (800)</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.black }]}>Black (900)</Text>
      </View>

      {/* Italic Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Italic Variants</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.regularItalic }]}>Regular Italic</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.mediumItalic }]}>Medium Italic</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.boldItalic }]}>Bold Italic</Text>
        <Text style={[styles.testText, { fontFamily: Fonts.lightItalic }]}>Light Italic</Text>
      </View>

      {/* Fallback Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fallback Test (System Font)</Text>
        <Text style={[styles.testText, { fontFamily: 'System' }]}>System Font (Fallback)</Text>
        <Text style={[styles.testText, { fontFamily: 'Montserrat-Regular' }]}>Direct Name Test</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    ...FontStyles.h1,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...FontStyles.h4,
    marginBottom: 15,
    color: '#e74c3c',
  },
  testText: {
    fontSize: 16,
    marginVertical: 3,
    color: '#333',
  },
});

export default FontTest;
