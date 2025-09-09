/**
 * CartButton Configuration
 * Centralized place to customize all cart button styles
 */

// Button Colors
export const COLORS = {
  primary: '#F70D24',        // Main red color
  white: '#FFFFFF',          // White text/background
  text: '#F70D24',           // Red text for count
  background: '#FFFFFF',     // White background for count box
};

// Button Sizes - Different variants
export const SIZES = {
  // Small size (for promotion items)
  small: {
    addButton: {
      width: '30%',
      height: '3.5%',
      borderRadius: '1%',
     //r paddingVertical: '%',
      paddingHorizontal: '3%',
      minHeight: '3.5%',
      minWidth: '15%',
    },
    cartContainer: {
      width: '30%',
      height: '3.5%',
      borderRadius: '1%',
      paddingHorizontal: '1%',
    },
    quantityButton: {
      paddingVertical: '0.5%',
      paddingHorizontal: '4%',
      minWidth: '5%',
      minHeight: '2.5%',
    },
    countBox: {
      paddingVertical: '1%',
      paddingHorizontal: '3.6%',
      minWidth: '6%',
      borderRadius: '0.5%',
      marginHorizontal: '0.5%',
    },
  },
  
  // Medium size (default - for sub-category items)
  medium: {
    addButton: {
      width: '30%',
      height: '5%',
      borderRadius: '2%',
    //  paddingVertical: '1%',
      paddingHorizontal: '8%',
      minHeight: '6%',
      minWidth: '25%',
    },
    cartContainer: {
      width: '32%',
      height: '5%',
      borderRadius: '1%',
     // paddingHorizontal: '.2%',
    },
    quantityButton: {
     // paddingVertical: '1%',
      paddingHorizontal: '4%',
      minWidth: '8%',
      minHeight: '3%',
    },
    countBox: {
      paddingVertical: '1.4%',
      paddingHorizontal: '4%',
      minWidth: '10%',
    //  borderRadius: '1%',
      marginHorizontal: '1%',
    },
  },
  
  // Large size (for product details)
  large: {
    addButton: {
      width: '40%',
      height: '7%',
      borderRadius: '2%',
      paddingVertical: '3.5%',
      paddingHorizontal: '12%',
      minHeight: '7%',
      minWidth: '35%',
    },
    cartContainer: {
      width: '35%',
      height: '5.5%',
      borderRadius: '2%',
      paddingHorizontal: '1%',
    },
    quantityButton: {
      paddingVertical: '1%',
      paddingHorizontal: '4%',
      minWidth: '8%',
      minHeight: '4%',
    },
    countBox: {
      paddingVertical: '2%',
      paddingHorizontal: '4%',
      minWidth: '10%',
      borderRadius: '1%',
      marginHorizontal: '1%',
    },
  },
};

// Typography - Different sizes
export const TYPOGRAPHY = {
  small: {
    addButtonText: {
      fontSize: '3%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    quantityButtonText: {
      fontSize: '2.5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    countText: {
      fontSize: '3%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
  },
  
  medium: {
    addButtonText: {
      fontSize: '5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    quantityButtonText: {
      fontSize: '3.5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    countText: {
      fontSize: '4.5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
  },
  
  large: {
    addButtonText: {
      fontSize: '6%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    quantityButtonText: {
      fontSize: '3.5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
    countText: {
      fontSize: '4.5%',
      fontWeight: 'bold',
      fontFamily: 'System',
    },
  },
};

// Margins and Spacing
export const SPACING = {
  container: {
    marginLeft: '1%',
    marginRight: '2%',
  },
  
  wrapper: {
    minHeight: '6%',
  },
};

// Button States
export const STATES = {
  enabled: {
    opacity: 1,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  pressed: {
    opacity: 0.8,
  },
};

// Export all configurations
export const CART_BUTTON_CONFIG = {
  colors: COLORS,
  sizes: SIZES,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  states: STATES,
};
