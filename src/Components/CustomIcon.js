import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomIcon = ({ name, size = 24, color = '#000', family = 'Ionicons' }) => {
  // Icon mapping for Ionicons
  const ioniconsMap = {
    'home': '🏠',
    'heart': '❤️',
    'heart-outline': '🤍',
    'user': '👤',
    'cart': '🛒',
    'star': '⭐',
    'search': '🔍',
    'menu': '☰',
    'close': '✕',
    'arrow-back': '←',
    'arrow-forward': '→',
    'settings': '⚙️',
    'notifications': '🔔',
    'location': '📍',
    'phone': '📞',
    'email': '✉️',
    'share': '📤',
    'favorite': '❤️',
    'favorite-outline': '🤍',
    'add': '+',
    'remove': '-',
    'edit': '✏️',
    'delete': '🗑️',
    'check': '✓',
    'warning': '⚠️',
    'info': 'ℹ️',
    'error': '❌',
    'success': '✅',
  };

  // Icon mapping for FontAwesome
  const fontAwesomeMap = {
    'user': '👤',
    'shopping-cart': '🛒',
    'home': '🏠',
    'heart': '❤️',
    'star': '⭐',
    'search': '🔍',
    'bars': '☰',
    'times': '✕',
    'cog': '⚙️',
    'bell': '🔔',
    'map-marker': '📍',
    'phone': '📞',
    'envelope': '✉️',
    'share': '📤',
    'plus': '+',
    'minus': '-',
    'edit': '✏️',
    'trash': '🗑️',
    'check': '✓',
    'exclamation-triangle': '⚠️',
    'info-circle': 'ℹ️',
    'times-circle': '❌',
    'check-circle': '✅',
  };

  // Icon mapping for MaterialIcons
  const materialIconsMap = {
    'home': '🏠',
    'favorite': '❤️',
    'favorite-border': '🤍',
    'person': '👤',
    'shopping-cart': '🛒',
    'star': '⭐',
    'search': '🔍',
    'menu': '☰',
    'close': '✕',
    'arrow-back': '←',
    'arrow-forward': '→',
    'settings': '⚙️',
    'notifications': '🔔',
    'location-on': '📍',
    'phone': '📞',
    'email': '✉️',
    'share': '📤',
    'add': '+',
    'remove': '-',
    'edit': '✏️',
    'delete': '🗑️',
    'check': '✓',
    'warning': '⚠️',
    'info': 'ℹ️',
    'error': '❌',
    'check-circle': '✅',
  };

  let iconMap = ioniconsMap;
  if (family === 'FontAwesome') {
    iconMap = fontAwesomeMap;
  } else if (family === 'MaterialIcons') {
    iconMap = materialIconsMap;
  }

  const iconChar = iconMap[name] || '?';

  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {iconChar}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default CustomIcon;
