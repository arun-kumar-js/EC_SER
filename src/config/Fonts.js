// Font configuration for Montserrat family
export const Fonts = {
  // Regular weights
  regular: 'Montserrat-Regular',
  light: 'Montserrat-Light',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
  extraBold: 'Montserrat-ExtraBold',
  black: 'Montserrat-Black',
  thin: 'Montserrat-Thin',
  extraLight: 'Montserrat-ExtraLight',

  // Italic weights
  regularItalic: 'Montserrat-Italic',
  lightItalic: 'Montserrat-LightItalic',
  mediumItalic: 'Montserrat-MediumItalic',
  semiBoldItalic: 'Montserrat-SemiBoldItalic',
  boldItalic: 'Montserrat-BoldItalic',
  extraBoldItalic: 'Montserrat-ExtraBoldItalic',
  blackItalic: 'Montserrat-BlackItalic',
  thinItalic: 'Montserrat-ThinItalic',
  extraLightItalic: 'Montserrat-ExtraLightItalic',

  // Variable font (if supported)
  variable: 'Montserrat-VariableFont_wght',
  variableItalic: 'Montserrat-Italic-VariableFont_wght',
};

// Font weights mapping
export const FontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Common font styles for easy use
export const FontStyles = {
  // Headers
  h1: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    fontWeight: FontWeights.bold,
  },
  h2: {
    fontFamily: Fonts.semiBold,
    fontSize: 28,
    fontWeight: FontWeights.semiBold,
  },
  h3: {
    fontFamily: Fonts.medium,
    fontSize: 24,
    fontWeight: FontWeights.medium,
  },
  h4: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    fontWeight: FontWeights.medium,
  },
  h5: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: FontWeights.regular,
  },
  h6: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: FontWeights.regular,
  },

  // Body text
  bodyLarge: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: FontWeights.regular,
  },
  bodyMedium: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: FontWeights.regular,
  },
  bodySmall: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontWeight: FontWeights.regular,
  },

  // Labels and buttons
  labelLarge: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontWeight: FontWeights.medium,
  },
  labelMedium: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    fontWeight: FontWeights.medium,
  },
  labelSmall: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    fontWeight: FontWeights.medium,
  },

  // Captions
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontWeight: FontWeights.regular,
  },
  overline: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
  },
};

export default Fonts;
