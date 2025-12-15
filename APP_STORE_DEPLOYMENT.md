# NoCap - App Store Deployment Guide

## Step 1: Generate Icon Files

1. Open `public/generate-icons.html` in your browser
2. Click "Generate All Icons"
3. Click "Download All" to save all icon sizes
4. Place the downloaded PNG files in the `public/` folder

Required icon sizes:
- 16x16, 32x32 (Favicon)
- 72x72, 96x96, 128x128, 144x144 (Android)
- 152x152, 180x180 (iOS)
- 192x192, 384x384, 512x512 (PWA)

## Step 2: Test PWA Locally

1. Run `npm run build`
2. Deploy to Vercel or your hosting platform
3. Open on mobile device
4. Look for "Add to Home Screen" prompt
5. Verify the app installs and works offline

## Step 3: Submit to iOS App Store

### Option A: Using PWA Builder (Easiest)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed app URL
3. Click "Package for Stores"
4. Download iOS package
5. Submit to App Store Connect using the generated package

### Option B: Using Capacitor (More Control)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor
npx cap init NoCap com.nocap.app --web-dir=dist

# Add iOS platform
npx cap add ios

# Open in Xcode
npx cap open ios
```

Then in Xcode:
1. Configure signing certificates
2. Add app icons to Assets.xcassets
3. Archive and submit to App Store

### iOS App Store Requirements:
- Apple Developer Account ($99/year)
- App Store screenshots (1290x2796, 1284x2778, etc.)
- Privacy policy URL
- App description and keywords
- Age rating

## Step 4: Submit to Google Play Store

### Option A: Using PWA Builder (Easiest)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed app URL
3. Click "Package for Stores"
4. Download Android package (.aab file)
5. Submit to Google Play Console

### Option B: Using Capacitor
```bash
# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android
```

Then in Android Studio:
1. Configure signing key
2. Add app icons
3. Build signed bundle
4. Submit to Google Play Console

### Google Play Store Requirements:
- Google Play Developer Account ($25 one-time fee)
- App screenshots (1080x1920, 1080x2340)
- Feature graphic (1024x500)
- Privacy policy URL
- App description
- Content rating questionnaire

## Step 5: Alternative - Trusted Web Activity (TWA)

For a simpler Android approach without full native wrapper:

1. Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap):
```bash
npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json
npx @bubblewrap/cli build
```

2. This creates a minimal Android app that wraps your PWA
3. Submit the generated APK/AAB to Google Play Store

## Quick Checklist

### Before Submission:
- [ ] All icons generated and in correct sizes
- [ ] PWA manifest properly configured
- [ ] Service worker functioning
- [ ] HTTPS enabled on production
- [ ] App tested on iOS Safari
- [ ] App tested on Android Chrome
- [ ] Privacy policy created and hosted
- [ ] Terms of service created
- [ ] App screenshots prepared
- [ ] App description written
- [ ] Developer accounts created

### Testing:
- [ ] PWA installs on iOS (Safari > Share > Add to Home Screen)
- [ ] PWA installs on Android (Chrome > Menu > Add to Home Screen)
- [ ] App works offline
- [ ] All features functional in installed mode
- [ ] Icons display correctly
- [ ] Splash screen appears (on supported devices)

## Recommended Approach

For fastest deployment:
1. **Web/PWA**: Already done! Users can install from browser
2. **Android**: Use PWA Builder (5-10 minutes)
3. **iOS**: Use PWA Builder or TestFlight for testing first

## Additional Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Apple App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android App Quality Guidelines](https://developer.android.com/docs/quality-guidelines/core-app-quality)

## Note on Web App vs Native App

Your app is currently a PWA (Progressive Web App), which means:
- Users can install it directly from the browser
- No app store submission needed for basic functionality
- Works on both iOS and Android
- Updates instantly (no app store review delay)

For app store presence and additional features:
- Use PWA Builder for quick packaging
- Use Capacitor for full native capabilities
- Consider React Native for completely native rewrite (if needed)
