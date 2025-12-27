import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, History, Coins, Gamepad2, HelpCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import ScanHistory from './ScanHistory';
import ScanResults from './ScanResults';
import TokenPurchaseModal from './TokenPurchaseModal';
import Game from './Game';
import Support from './Support';
import { Scan, supabase } from '../lib/supabase';

type View = 'upload' | 'history' | 'results';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('upload');
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [freeScansRemaining, setFreeScansRemaining] = useState<number>(3);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalReason, setTokenModalReason] = useState<'insufficient' | 'voluntary'>('voluntary');
  const [showGame, setShowGame] = useState(false);
  const [freeScanExpanded, setFreeScanExpanded] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const handleSignOut = async () => {
    console.log('Logout button clicked');
    await signOut();
  };

  useEffect(() => {
    fetchTokenBalance();
  }, [user]);

  const fetchTokenBalance = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('token_balances')
      .select('balance, free_scans_used')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setTokenBalance(data.balance);
      setFreeScansRemaining(3 - (data.free_scans_used || 0));
    }
  };

  const handleScanComplete = (scan: Scan, tokensRemaining?: number, freeScansRemaining?: number) => {
    setSelectedScan(scan);
    setCurrentView('results');
    if (tokensRemaining !== undefined) {
      setTokenBalance(tokensRemaining);
    }
    if (freeScansRemaining !== undefined) {
      setFreeScansRemaining(freeScansRemaining);
    }
  };

  const handleInsufficientTokens = () => {
    setTokenModalReason('insufficient');
    setShowTokenModal(true);
  };

  const handleViewScan = (scan: Scan) => {
    setSelectedScan(scan);
    setCurrentView('results');
  };

  const openTokenPurchase = () => {
    setTokenModalReason('voluntary');
    setShowTokenModal(true);
  };

  const handleGamePointsUpdate = (points: number, freeScans: number) => {
    if (freeScans > 0) {
      setFreeScansRemaining(freeScans);
    }
  };

  const handlePlayGame = () => {
    setShowGame(true);
  };

  return (
    <div className="min-h-screen galaxy-content">
      <nav className="bg-slate-900/40 backdrop-blur-md border-b border-cyan-500/30 pt-safe-top shadow-lg shadow-cyan-500/10" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1
                onClick={() => setCurrentView('upload')}
                className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}
              >
                NoCap
              </h1>
              <button
                onClick={() => setShowGame(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-black text-sm shadow-lg shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Play</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openTokenPurchase}
                className="px-3 sm:px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-full font-bold transition-all flex items-center gap-2 backdrop-blur-sm border border-yellow-500/30 shadow-lg shadow-yellow-500/20"
              >
                <Coins className="w-4 h-4" />
                <span>{tokenBalance}</span>
              </button>
              <button
                onClick={() => setFreeScanExpanded(!freeScanExpanded)}
                className={`flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full font-black text-sm shadow-lg shadow-emerald-500/50 transition-all duration-300 sm:w-auto sm:h-auto sm:px-4 sm:py-2 ${
                  freeScanExpanded ? 'w-auto px-3 h-10' : 'w-10 h-10'
                }`}
              >
                <span className={`sm:hidden transition-all duration-300 ${freeScanExpanded ? 'whitespace-nowrap' : ''}`}>
                  {freeScanExpanded ? `${freeScansRemaining} free ${freeScansRemaining === 1 ? 'scan' : 'scans'}` : freeScansRemaining}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">{freeScansRemaining} free {freeScansRemaining === 1 ? 'scan' : 'scans'}</span>
              </button>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => setCurrentView('upload')}
                  className={`px-5 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                    currentView === 'upload'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Scan
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-5 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                    currentView === 'history'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </div>
              <button
                onClick={() => setShowSupport(true)}
                className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 active:bg-cyan-500/40 text-cyan-300 rounded-full font-bold transition-all backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-500/20 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Support & Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-300 rounded-full font-bold transition-all flex items-center gap-2 backdrop-blur-sm border border-red-500/30 shadow-lg shadow-red-500/20 min-h-[44px] min-w-[44px] justify-center relative z-50 touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 sm:pb-8">
        {currentView === 'upload' && (
          <FileUpload
            onScanComplete={handleScanComplete}
            onInsufficientTokens={handleInsufficientTokens}
          />
        )}
        {currentView === 'history' && <ScanHistory onViewScan={handleViewScan} />}
        {currentView === 'results' && selectedScan && (
          <ScanResults scan={selectedScan} onBack={() => setCurrentView('history')} />
        )}
      </main>

      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        currentBalance={tokenBalance}
        reason={tokenModalReason}
        onPlayGame={handlePlayGame}
      />

      <Game
        key={showGame ? 'open' : 'closed'}
        isOpen={showGame}
        onClose={() => setShowGame(false)}
        onPointsUpdate={handleGamePointsUpdate}
      />

      {showSupport && (
        <Support onClose={() => setShowSupport(false)} />
      )}

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md shadow-2xl border-t border-cyan-500/30">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setCurrentView('upload')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
              currentView === 'upload' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' : 'text-cyan-300 hover:text-cyan-400'
            }`}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-bold">Scan</span>
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
              currentView === 'history' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' : 'text-cyan-300 hover:text-cyan-400'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs font-bold">History</span>
          </button>
          <button
            onClick={() => setShowSupport(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-cyan-300 hover:text-cyan-400"
          >
            <HelpCircle className="w-6 h-6" />
            <span className="text-xs font-bold">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
}
