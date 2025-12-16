import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, History, Coins, Gamepad2 } from 'lucide-react';
import FileUpload from './FileUpload';
import ScanHistory from './ScanHistory';
import ScanResults from './ScanResults';
import TokenPurchaseModal from './TokenPurchaseModal';
import Game from './Game';
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
    <div className="min-h-screen bg-gradient-to-b from-pink-500 via-pink-400 to-orange-400">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 pt-safe-top" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1
                onClick={() => setCurrentView('upload')}
                className="text-2xl font-black text-white cursor-pointer hover:opacity-80 transition-opacity"
                style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}
              >
                NoCap
              </h1>
              <button
                onClick={() => setShowGame(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-orange-400 hover:from-pink-500 hover:to-orange-500 text-white rounded-full font-black text-sm shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Play</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openTokenPurchase}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Coins className="w-4 h-4" />
                <span>{tokenBalance}</span>
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-black text-sm shadow-lg">
                {freeScansRemaining} free {freeScansRemaining === 1 ? 'scan' : 'scans'}
              </div>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => setCurrentView('upload')}
                  className={`px-5 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                    currentView === 'upload'
                      ? 'bg-white text-pink-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Scan
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-5 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                    currentView === 'history'
                      ? 'bg-white text-pink-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full font-bold transition-all flex items-center gap-2 backdrop-blur-sm min-h-[44px] min-w-[44px] justify-center relative z-50 touch-manipulation"
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

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setCurrentView('upload')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
              currentView === 'upload' ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg' : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-bold">Scan</span>
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
              currentView === 'history' ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg' : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs font-bold">History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
