import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, FontStyles } from '../Config/Fonts';

const FontUsageExample = () => {
  return (
    <View style={styles.container}>
      {/* Using FontStyles (Recommended) */}
      <Text style={FontStyles.h1}>Heading 1 - Bold</Text>
      <Text style={FontStyles.h2}>Heading 2 - SemiBold</Text>
      <Text style={FontStyles.h3}>Heading 3 - Medium</Text>
      <Text style={FontStyles.bodyLarge}>Body Large - Regular</Text>
      <Text style={FontStyles.bodyMedium}>Body Medium - Regular</Text>
      <Text style={FontStyles.labelLarge}>Label Large - Medium</Text>
      <Text style={FontStyles.caption}>Caption - Regular</Text>

      {/* Using direct Fonts */}
      <Text style={[styles.customText, { fontFamily: Fonts.bold }]}>
        Custom Bold Text
      </Text>
      <Text style={[styles.customText, { fontFamily: Fonts.medium }]}>
        Custom Medium Text
      </Text>
      <Text style={[styles.customText, { fontFamily: Fonts.light }]}>
        Custom Light Text
      </Text>

      {/* Italic variants */}
      <Text style={[styles.customText, { fontFamily: Fonts.regularItalic }]}>
        Italic Regular Text
      </Text>
      <Text style={[styles.customText, { fontFamily: Fonts.boldItalic }]}>
        Italic Bold Text
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  customText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default FontUsageExample;
