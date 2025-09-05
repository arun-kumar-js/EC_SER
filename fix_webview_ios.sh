#!/bin/bash

echo "🔧 Fixing iOS WebView linking issue..."

# Navigate to iOS directory
cd ios

echo "🧹 Cleaning iOS build..."
# Remove build artifacts
rm -rf build/
rm -rf Pods/
rm -f Podfile.lock

echo "📱 Reinstalling pods..."
# Reinstall pods
pod install --repo-update

echo "✅ iOS WebView linking should now be fixed!"
echo "🚀 You can now run: npx react-native run-ios"
