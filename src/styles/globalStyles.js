import { Platform, Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

// Font Families
export const FONTS = {
  // System fonts for better performance and native feel
  regular: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Bold',
  light: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Light',
  semiBold: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  
  // Fallback to Montserrat if needed (uncomment if custom fonts are working)
  // regular: 'Montserrat-Regular',
  // medium: 'Montserrat-Medium',
  // bold: 'Montserrat-Bold',
  // light: 'Montserrat-Light',
  // semiBold: 'Montserrat-SemiBold',
};

// Font Sizes
export const FONT_SIZES = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(18),
  xxl: moderateScale(20),
  xxxl: moderateScale(24),
  title: moderateScale(28),
  header: moderateScale(32),
};

// Colors
export const COLORS = {
  primary: '#07575B',
  secondary: '#042026',
  accent: '#EF3340',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#374151',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

// Spacing
export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Border Radius
export const BORDER_RADIUS = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  full: scale(999),
};

// Common Text Styles
export const TEXT_STYLES = {
  // Headers
  h1: {
    fontSize: FONT_SIZES.header,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: moderateScale(40),
  },
  h2: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: moderateScale(36),
  },
  h3: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: moderateScale(32),
  },
  h4: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    lineHeight: moderateScale(28),
  },
  h5: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    lineHeight: moderateScale(24),
  },
  h6: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    lineHeight: moderateScale(20),
  },

  // Body Text
  body: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: moderateScale(20),
  },
  bodyLarge: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: moderateScale(24),
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: moderateScale(18),
  },

  // Labels
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: moderateScale(18),
  },
  labelLarge: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: moderateScale(20),
  },

  // Buttons
  button: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonLarge: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonSmall: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
  },

  // Captions
  caption: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: moderateScale(16),
  },

  // Links
  link: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
};

// Common Container Styles
export const CONTAINER_STYLES = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Common Button Styles
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  large: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
};

// Input Styles
export const INPUT_STYLES = {
  container: {
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: verticalScale(12),
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  label: {
    ...TEXT_STYLES.label,
    marginBottom: SPACING.xs,
  },
  error: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
};

// Shadow Styles
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Responsive Helpers
export const RESPONSIVE = {
  width: width,
  height: height,
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  scale: scale,
  verticalScale: verticalScale,
  moderateScale: moderateScale,
};

export default {
  FONTS,
  FONT_SIZES,
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TEXT_STYLES,
  CONTAINER_STYLES,
  BUTTON_STYLES,
  INPUT_STYLES,
  SHADOWS,
  RESPONSIVE,
};

