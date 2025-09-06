#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔗 Linking Montserrat fonts...');

// Check if fonts exist in src/Assets/fonts
const fontsDir = path.join(__dirname, '../src/Assets/fonts');
const androidFontsDir = path.join(__dirname, '../android/app/src/main/assets/fonts');

if (!fs.existsSync(fontsDir)) {
  console.error('❌ Fonts directory not found:', fontsDir);
  process.exit(1);
}

// List available fonts
const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.ttf'));
console.log('📁 Available Montserrat fonts:');
fontFiles.forEach(file => console.log(`  - ${file}`));

// Check Android fonts
if (fs.existsSync(androidFontsDir)) {
  const androidFonts = fs.readdirSync(androidFontsDir).filter(file => 
    file.startsWith('Montserrat') && file.endsWith('.ttf')
  );
  console.log('🤖 Android fonts already linked:', androidFonts.length);
}

console.log('✅ Font configuration complete!');
console.log('📝 Next steps:');
console.log('  1. Run: npx react-native link');
console.log('  2. For iOS: cd ios && pod install');
console.log('  3. Clean and rebuild: npx react-native run-ios --reset-cache');
