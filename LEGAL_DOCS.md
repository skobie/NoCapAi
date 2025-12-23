# Legal Documents for App Store Submission

## Document URLs

Once deployed to your domain (e.g., `nocap.app`), use these URLs for your App Store submission:

### Privacy Policy
```
https://your-domain.com/privacy-policy.html
```

### Terms of Service
```
https://your-domain.com/terms-of-service.html
```

## Files Created

1. **Privacy Policy**: `/public/privacy-policy.html`
   - Covers data collection, usage, storage, and user rights
   - Complies with GDPR, CCPA, and Apple App Store requirements
   - Details third-party services (Supabase, Stripe)

2. **Terms of Service**: `/public/terms-of-service.html`
   - Defines acceptable use and prohibited conduct
   - Explains token system and refund policy
   - Includes disclaimers and liability limitations
   - Contains App Store-specific terms for iOS and Android

## Important Notes for App Store Submission

### Before Submitting to App Store:

1. **Deploy Your App**
   - Make sure these files are live on your production domain
   - Test the URLs to ensure they're accessible

2. **Update Contact Information**
   - In both documents, update these placeholder emails:
     - `privacy@nocap.app` (Privacy Policy)
     - `support@nocap.app` (Terms of Service)
     - `legal@nocap.app` (Terms of Service)
   - Or set up email forwarding for these addresses

3. **Review Jurisdiction**
   - In Terms of Service, section 12.1, add your state/country:
     - Currently shows: `[Your State/Country]`
     - Update to your actual jurisdiction (e.g., "California, USA")

4. **Customize as Needed**
   - Review both documents for accuracy with your specific implementation
   - Add any additional features or services you use
   - Consult with a lawyer if handling sensitive data or operating in specific jurisdictions

## What to Enter in App Store Connect

### App Privacy Section:
- Privacy Policy URL: `https://your-domain.com/privacy-policy.html`

### App Information Section:
- Terms of Service URL: `https://your-domain.com/terms-of-service.html` (optional but recommended)

### Support URL:
- You can use the same domain with a `/support` page or your main website

## Checklist

- [ ] Both HTML files are in the `/public` folder
- [ ] Files are deployed to production
- [ ] URLs are accessible from any browser
- [ ] Contact email addresses are updated
- [ ] Jurisdiction is specified in Terms of Service
- [ ] Documents are reviewed for accuracy
- [ ] URLs are added to App Store Connect

## Next Steps

1. Deploy your app to production (Vercel, Netlify, etc.)
2. Verify the documents are accessible at their URLs
3. Copy the URLs into App Store Connect when submitting
4. Keep copies of these documents for your records

---

**Note**: These documents are templates and may need customization based on your specific requirements, jurisdiction, or legal advice. Consider having them reviewed by a legal professional before publishing.
