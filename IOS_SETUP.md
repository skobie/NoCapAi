# iOS Setup Guide for NoCap AI

## Project Configuration

Your app has been configured with Capacitor for iOS deployment:
- **App Name:** NoCap AI
- **Bundle ID:** com.nocap.ai
- **Web Directory:** dist

## Prerequisites

To build and deploy the iOS app, you'll need:
1. **macOS** computer with Xcode installed
2. **Xcode 14+** (download from App Store)
3. **Apple Developer Account** (free for testing, $99/year for App Store)
4. **CocoaPods** (should be installed automatically)

## Building for iOS

### Quick Commands

```bash
# Build and sync web assets to iOS
npm run ios:sync

# Open Xcode project
npm run ios:open

# Build and open Xcode in one command
npm run ios:build
```

### Step-by-Step Process

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync to iOS:**
   ```bash
   npx cap sync ios
   ```

3. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

## Xcode Setup

Once Xcode opens:

1. **Select your Team:**
   - Click on "App" in the project navigator
   - Go to "Signing & Capabilities"
   - Select your Apple Developer team

2. **Configure App Icons:**
   - Navigate to `App > Assets.xcassets > AppIcon`
   - Add your app icons in all required sizes

3. **Update Info.plist:**
   - Add camera/photo permissions if needed
   - Configure supported orientations
   - Set minimum iOS version (iOS 13.0+)

4. **Test on Simulator:**
   - Select a simulator from the device menu
   - Press ⌘+R to build and run

5. **Test on Device:**
   - Connect your iPhone/iPad via USB
   - Select it from the device menu
   - Trust the developer certificate on the device
   - Press ⌘+R to build and run

## App Store Submission

### Preparing for Submission

1. **Update version and build numbers** in Xcode
2. **Add app icons** in all required sizes
3. **Create screenshots** for all device sizes
4. **Prepare app description** and metadata
5. **Set up App Store Connect** listing
6. **Archive the app:**
   - Select "Any iOS Device" as destination
   - Product > Archive
   - Upload to App Store Connect

### Required Assets

- App icons (1024x1024 for App Store)
- Screenshots for:
  - iPhone 6.7" display
  - iPhone 6.5" display
  - iPhone 5.5" display
  - iPad Pro (3rd gen)
  - iPad Pro (2nd gen)

### Privacy and Permissions

Your app uses:
- Network access (for API calls)
- File upload (for image/video scanning)

Update Info.plist with appropriate usage descriptions.

## Configuration Files

### capacitor.config.ts
Configures:
- App ID and name
- Web directory
- Server settings for production
- Allowed navigation domains
- iOS-specific settings

### Important Notes

- Always run `npm run build` before syncing to iOS
- Test on both simulator and real devices
- The app uses environment variables from `.env.production`
- Supabase and Stripe domains are whitelisted for navigation

## Troubleshooting

### White screen on iOS
1. Check environment variables are properly set
2. Verify build was successful (`npm run build`)
3. Check Xcode console for JavaScript errors
4. Ensure all required permissions are granted

### Build failures
1. Clean build folder: Product > Clean Build Folder
2. Delete DerivedData folder
3. Run `npx cap sync ios` again
4. Restart Xcode

### CocoaPods issues
```bash
cd ios/App
pod install --repo-update
cd ../..
npx cap sync ios
```

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
