import { X, Coins, Zap, Crown, Sparkles, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  reason?: 'insufficient' | 'voluntary';
  onPlayGame?: () => void;
}

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  popular?: boolean;
  icon: typeof Coins;
  savings?: string;
}

const packages: TokenPackage[] = [
  {
    id: 'small',
    tokens: 500,
    price: 0.99,
    icon: Coins,
  },
  {
    id: 'medium',
    tokens: 3000,
    price: 4.99,
    popular: true,
    icon: Zap,
    savings: 'Save 17%',
  },
  {
    id: 'large',
    tokens: 7000,
    price: 10.00,
    icon: Crown,
    savings: 'Save 29%',
  },
];

export default function TokenPurchaseModal({
  isOpen,
  onClose,
  currentBalance = 0,
  reason = 'voluntary',
  onPlayGame
}: TokenPurchaseModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Please log in to purchase tokens');
        setLoading(null);
        return;
      }

      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (selectedPackage) {
        trackEvent('begin_checkout', {
          currency: 'USD',
          value: selectedPackage.price,
          items: [{
            item_id: packageId,
            item_name: `${selectedPackage.tokens} Tokens`,
            price: selectedPackage.price,
            quantity: 1
          }]
        });
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { packageType: packageId },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      const message = error?.message || 'Failed to create checkout session';
      alert(message + '. Please try logging out and back in.');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-cyan-700 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-1.5 sm:gap-2" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-lg flex-shrink-0" />
              <span className="truncate">Power Up!</span>
            </h2>
            {reason === 'insufficient' && (
              <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5 sm:mt-1 drop-shadow-md">
                Out of tokens! Grab more to keep scanning
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-all text-white flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {onPlayGame && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl sm:rounded-3xl shadow-xl border-2 sm:border-4 border-white/30">
              <div className="text-center">
                <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2 sm:mb-3 drop-shadow-lg" />
                <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 sm:mb-2 px-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}>
                  Play to Earn Free Scans!
                </h3>
                <p className="text-white/90 font-bold text-xs sm:text-sm mb-3 sm:mb-4 drop-shadow-md px-2">
                  Guess if content is AI-generated and earn points to unlock free scans
                </p>
                <button
                  onClick={() => {
                    onPlayGame();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-purple-600 font-black text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  PLAY GAME NOW
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 backdrop-blur rounded-full mb-3 sm:mb-4 shadow-lg">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
              <span className="text-xs sm:text-sm font-black text-gray-900">
                Balance: {currentBalance} tokens
              </span>
            </div>
            <p className="text-white font-bold text-sm sm:text-base md:text-lg drop-shadow-md px-4">
              {onPlayGame ? 'Or buy tokens to scan instantly:' : 'Each scan = 100 tokens. Choose your power pack:'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all transform hover:scale-105 ${
                    pkg.popular
                      ? 'bg-white shadow-2xl border-2 sm:border-4 border-white'
                      : 'bg-white/90 backdrop-blur shadow-xl'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-cyan-600 to-slate-800 text-white text-xs font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg whitespace-nowrap" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        BEST DEAL
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4 sm:mb-6 mt-1 sm:mt-2">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center shadow-xl ${
                        pkg.popular
                          ? 'bg-gradient-to-br from-slate-800 to-cyan-600'
                          : 'bg-gradient-to-br from-slate-700 to-slate-900'
                      }`}
                    >
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1" style={{ textShadow: '2px 2px 0px rgba(6,182,212,0.3)' }}>
                      {pkg.tokens.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-600 mb-2 sm:mb-3">TOKENS</div>
                    {pkg.savings && (
                      <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-green-400 text-white text-xs font-black rounded-full shadow-md">
                        {pkg.savings}
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-4xl sm:text-5xl font-black text-gray-900 mb-1" style={{ textShadow: '2px 2px 0px rgba(6,182,212,0.2)' }}>
                      ${pkg.price.toFixed(2)}
                    </div>
                    <div className="text-xs font-semibold text-gray-500">
                      ${(pkg.price / pkg.tokens).toFixed(4)} per token
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading !== null}
                    className={`w-full py-3 sm:py-3.5 rounded-full font-black text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-slate-800 to-cyan-600 hover:from-slate-900 hover:to-cyan-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {loading === pkg.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">Processing...</span>
                      </span>
                    ) : (
                      'GET IT NOW'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-white/90 backdrop-blur rounded-2xl sm:rounded-3xl shadow-lg">
            <h3 className="font-black text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Why Tokens?</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-semibold text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0"></span>
                <span>Each content scan uses 100 tokens</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0"></span>
                <span>Tokens never expire</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0"></span>
                <span>Secure payment via Stripe</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0"></span>
                <span>Works everywhere, anytime</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
