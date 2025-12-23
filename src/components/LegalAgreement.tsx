import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface LegalAgreementProps {
  onAccept: () => void;
}

export default function LegalAgreement({ onAccept }: LegalAgreementProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const canProceed = agreedToTerms && agreedToPrivacy;

  const handleContinue = () => {
    if (canProceed) {
      localStorage.setItem('legal-agreement-accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="min-h-screen galaxy-bg galaxy-content flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <div className="text-center mb-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 inline-flex" style={{
            letterSpacing: '-0.05em',
            transform: 'rotate(-2deg)'
          }}>
            {'NoCap'.split('').map((letter, index) => (
              <span
                key={index}
                className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent wave-letter"
                style={{
                  textShadow: '0 0 40px rgba(34, 211, 238, 0.5)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-cyan-300 text-lg font-bold px-4 drop-shadow-lg">Welcome! Please review and accept our policies</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 p-6 space-y-4">
          <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-center mb-4">
            Before You Get Started
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-2xl border border-cyan-500/20 overflow-hidden">
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  <span className="font-bold text-white text-lg">Terms of Service</span>
                </div>
                {showTerms ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>

              {showTerms && (
                <div className="px-5 pb-4 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-300 space-y-4 leading-relaxed">
                    <h3 className="text-cyan-400 font-bold text-base mt-2">1. Acceptance of Terms</h3>
                    <p>By using NoCap, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>

                    <h3 className="text-cyan-400 font-bold text-base">2. Description of Service</h3>
                    <p>NoCap is a content scanning service that uses AI to analyze photos and videos for potentially inappropriate content. The service includes AI-powered analysis, scan history, and a token-based system.</p>

                    <h3 className="text-cyan-400 font-bold text-base">3. Eligibility</h3>
                    <p>You must be at least 13 years old to use NoCap. If you are between 13 and 18, you must have parental consent.</p>

                    <h3 className="text-cyan-400 font-bold text-base">4. Account Security</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

                    <h3 className="text-cyan-400 font-bold text-base">5. Acceptable Use</h3>
                    <p>You may only scan content you have legal rights to. You may not use the service for illegal activities, attempt to bypass security, or abuse the token system.</p>

                    <h3 className="text-cyan-400 font-bold text-base">6. Content Ownership</h3>
                    <p>You retain ownership of content you upload. We only process it temporarily for analysis purposes.</p>

                    <h3 className="text-cyan-400 font-bold text-base">7. Tokens and Payments</h3>
                    <p>Scans require tokens. You receive free daily scans and can purchase additional tokens. All sales are final and non-refundable except as required by law.</p>

                    <h3 className="text-cyan-400 font-bold text-base">8. Accuracy Disclaimer</h3>
                    <p className="font-semibold text-yellow-300">Important: NoCap uses AI technology that is not perfect. Scan results are guidance only. False positives and negatives may occur. Use your own judgment.</p>

                    <h3 className="text-cyan-400 font-bold text-base">9. Limitation of Liability</h3>
                    <p>The service is provided "as is" without warranties. We are not liable for decisions made based on scan results or for indirect damages.</p>

                    <h3 className="text-cyan-400 font-bold text-base">10. Termination</h3>
                    <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>

                    <div className="mt-4 pt-4 border-t border-cyan-500/20">
                      <p className="text-xs text-gray-400">
                        For complete terms, visit: <a href="/terms-of-service.html" target="_blank" className="text-cyan-400 underline hover:text-cyan-300">Full Terms of Service</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-cyan-500/20 overflow-hidden">
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <span className="font-bold text-white text-lg">Privacy Policy</span>
                </div>
                {showPrivacy ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>

              {showPrivacy && (
                <div className="px-5 pb-4 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-300 space-y-4 leading-relaxed">
                    <h3 className="text-cyan-400 font-bold text-base mt-2">1. Information We Collect</h3>
                    <p><strong>Account Information:</strong> Email address, password (encrypted), and account creation date.</p>
                    <p><strong>Content You Scan:</strong> Photos and videos are temporarily processed. We store scan results but NOT your original files permanently.</p>
                    <p><strong>Usage Data:</strong> Number of scans, timestamps, token balance, game points, device info, and IP address.</p>
                    <p><strong>Payment Information:</strong> Handled by Stripe. We do not store credit card details.</p>

                    <h3 className="text-cyan-400 font-bold text-base">2. How We Use Your Information</h3>
                    <p>We use your data to provide the service, process payments, improve features, ensure security, and comply with legal obligations.</p>

                    <h3 className="text-cyan-400 font-bold text-base">3. Data Storage and Security</h3>
                    <p>All data is encrypted in transit. Passwords are hashed. Your uploaded media is temporarily stored during analysis only (typically less than 5 minutes), then deleted.</p>

                    <h3 className="text-cyan-400 font-bold text-base">4. Data Retention</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Account data: While account is active</li>
                      <li>Scan history: 90 days</li>
                      <li>Uploaded media: Deleted after analysis (under 5 minutes)</li>
                      <li>Transaction records: 7 years</li>
                    </ul>

                    <h3 className="text-cyan-400 font-bold text-base">5. Third-Party Services</h3>
                    <p>We use Supabase (database), Stripe (payments), and content analysis APIs. These services have their own privacy policies.</p>

                    <h3 className="text-cyan-400 font-bold text-base">6. Data Sharing</h3>
                    <p className="font-semibold text-green-300">We do NOT sell, rent, or trade your personal information.</p>
                    <p>We only share data with your consent, with service providers under confidentiality agreements, or when required by law.</p>

                    <h3 className="text-cyan-400 font-bold text-base">7. Your Rights</h3>
                    <p>You can view, delete, and update your data. Request account deletion or data export by contacting us. We comply with GDPR and CCPA.</p>

                    <h3 className="text-cyan-400 font-bold text-base">8. Children's Privacy</h3>
                    <p>Not intended for children under 13. We do not knowingly collect data from children.</p>

                    <div className="mt-4 pt-4 border-t border-cyan-500/20">
                      <p className="text-xs text-gray-400">
                        For complete privacy details, visit: <a href="/privacy-policy.html" target="_blank" className="text-cyan-400 underline hover:text-cyan-300">Full Privacy Policy</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                  agreedToTerms
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'bg-slate-800 border-cyan-500/50 group-hover:border-cyan-500'
                }`}>
                  {agreedToTerms && (
                    <CheckCircle2 className="w-5 h-5 text-white absolute inset-0.5" />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I have read and agree to the <span className="text-cyan-400 font-semibold">Terms of Service</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                  agreedToPrivacy
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'bg-slate-800 border-cyan-500/50 group-hover:border-cyan-500'
                }`}>
                  {agreedToPrivacy && (
                    <CheckCircle2 className="w-5 h-5 text-white absolute inset-0.5" />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I have read and agree to the <span className="text-cyan-400 font-semibold">Privacy Policy</span>
              </span>
            </label>
          </div>

          <button
            onClick={handleContinue}
            disabled={!canProceed}
            className={`w-full py-4 px-6 rounded-full text-lg font-black transition-all transform ${
              canProceed
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50 hover:scale-105'
                : 'bg-slate-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to NoCap
          </button>

          <p className="text-xs text-center text-gray-400 pt-2">
            By continuing, you acknowledge that you understand and accept our policies
          </p>
        </div>
      </div>
    </div>
  );
}
