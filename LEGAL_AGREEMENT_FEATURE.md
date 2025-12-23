# Legal Agreement Feature

## Overview

When users first download and open the app, they will now see a legal agreement screen that requires them to accept both the Terms of Service and Privacy Policy before they can proceed to sign up or sign in.

## How It Works

### First Time Users
1. User opens the app for the first time
2. A welcome screen appears showing the NoCap logo
3. Two expandable sections display:
   - **Terms of Service** (with file icon)
   - **Privacy Policy** (with shield icon)
4. Users can click each section to expand and read the full legal text
5. Two checkboxes appear below:
   - "I have read and agree to the Terms of Service"
   - "I have read and agree to the Privacy Policy"
6. Users must check both boxes to enable the "Continue to NoCap" button
7. Once accepted, the agreement is saved in localStorage
8. User is taken to the Auth (Sign In/Sign Up) screen

### Returning Users
- Users who have already accepted the agreement will skip the legal screen
- They go directly to the Sign In/Sign Up screen
- The agreement acceptance is stored permanently in browser localStorage

## Features

### Expandable Sections
- Click to expand/collapse Terms of Service and Privacy Policy
- Each section shows key highlights and summaries
- Scrollable content within each section (max height 384px)
- Links to full legal documents at the bottom of each section

### Visual Design
- Matches the existing NoCap galaxy-themed design
- Cyan and blue gradient styling
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Custom checkboxes with icons

### User Experience
- Cannot proceed without accepting both agreements
- Clear visual feedback when checkboxes are selected
- Button is disabled until both are checked
- Smooth transition to Auth screen after acceptance

## Files Modified/Created

### New File
- `/src/components/LegalAgreement.tsx` - The legal agreement component

### Modified Files
- `/src/App.tsx` - Added logic to show LegalAgreement before Auth
- `/public/privacy-policy.html` - Full privacy policy (already created)
- `/public/terms-of-service.html` - Full terms of service (already created)

## localStorage Key

The agreement acceptance is stored under:
```javascript
localStorage.getItem('legal-agreement-accepted') // returns 'true' if accepted
```

## Testing the Feature

To test the legal agreement screen again after accepting:

1. Open browser developer tools
2. Go to Application > Local Storage
3. Delete the key `legal-agreement-accepted`
4. Refresh the page
5. The legal agreement screen will appear again

## Content Displayed

The legal agreement component shows summarized versions of:
- Key terms from Terms of Service
- Key privacy policy points
- Links to full documents

This ensures users understand the core policies without overwhelming them with the full legal text upfront, while still providing easy access to complete documents.
