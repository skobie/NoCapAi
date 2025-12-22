import { useState, useEffect } from 'react';
import { X, Play, Sparkles, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { trackGamePlay } from '../lib/analytics';

type GameState = 'intro' | 'countdown' | 'playing' | 'guessing' | 'result';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  isAI: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPointsUpdate: (points: number, freeScans: number) => void;
};

export default function Game({ isOpen, onClose, onPointsUpdate }: Props) {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [userGuess, setUserGuess] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamePoints, setGamePoints] = useState(0);
  const [earnedFreeScan, setEarnedFreeScan] = useState(false);
  const [mediaPool, setMediaPool] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setGameState('intro');
      setIsLoadingPoints(true);
      fetchGamePoints();
      fetchMediaPool();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      startPlaying();
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeRemaining === 0) {
      setGameState('guessing');
    }
  }, [gameState, timeRemaining]);

  const fetchGamePoints = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('token_balances')
      .select('game_points')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setGamePoints(data.game_points || 0);
    } else {
      setGamePoints(0);
    }
    setIsLoadingPoints(false);
  };

  const fetchMediaPool = async () => {
    setIsLoadingMedia(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-game-media`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'MISSING_API_KEY') {
          console.error('Pexels API key not configured');
        } else {
          console.error('Error fetching game media:', errorData);
        }
        setIsLoadingMedia(false);
        return;
      }

      const data = await response.json();

      if (data.media && data.media.length > 0) {
        setMediaPool(data.media);
        console.log(`Loaded ${data.media.length} media items from Pexels`);
      }
    } catch (error) {
      console.error('Error fetching game media:', error);
    }
    setIsLoadingMedia(false);
  };

  const startGame = () => {
    if (mediaPool.length === 0) {
      console.error('Cannot start game: no media available');
      return;
    }
    setGameState('countdown');
    setCountdown(3);
    setEarnedFreeScan(false);
  };

  const startPlaying = () => {
    if (mediaPool.length === 0) return;
    trackGamePlay();
    const randomMedia = mediaPool[Math.floor(Math.random() * mediaPool.length)];
    setCurrentMedia(randomMedia);
    setTimeRemaining(10);
    setGameState('playing');
  };

  const handleGuess = async (guessAI: boolean) => {
    if (!currentMedia || !user) return;

    setUserGuess(guessAI);
    const correct = guessAI === currentMedia.isAI;
    setIsCorrect(correct);

    if (correct) {
      const newPoints = gamePoints + 1;
      const pointsAfterReward = newPoints % 10;
      const shouldEarnFreeScan = newPoints >= 10 && gamePoints < 10;

      const { data: currentBalance } = await supabase
        .from('token_balances')
        .select('free_scans_used')
        .eq('user_id', user.id)
        .maybeSingle();

      if (shouldEarnFreeScan && currentBalance) {
        const newFreeScansUsed = currentBalance.free_scans_used - 1;

        await supabase
          .from('token_balances')
          .update({
            game_points: pointsAfterReward,
            free_scans_used: newFreeScansUsed,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        setEarnedFreeScan(true);
        setGamePoints(pointsAfterReward);
        onPointsUpdate(pointsAfterReward, 3 - newFreeScansUsed);
      } else {
        await supabase
          .from('token_balances')
          .update({
            game_points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        setGamePoints(newPoints);
        onPointsUpdate(newPoints, 0);
      }
    }

    setGameState('result');
  };

  const playAgain = () => {
    setUserGuess(null);
    setCurrentMedia(null);
    startGame();
  };

  const handleClose = () => {
    setGameState('intro');
    setUserGuess(null);
    setCurrentMedia(null);
    setCountdown(3);
    setTimeRemaining(10);
    setEarnedFreeScan(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-cyan-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Cap or No Cap?</h2>
              <p className="text-sm text-gray-600 font-semibold">
                {gamePoints} points • {gamePoints % 10 === 0 ? 10 : 10 - (gamePoints % 10)} more for free scan
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {gameState === 'intro' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Play className="w-12 h-12 text-white ml-1" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                Cap or No Cap?
              </h3>
              <p className="text-lg text-gray-600 font-semibold mb-8 max-w-md mx-auto">
                View an image or video for 10 seconds, then guess if it's AI-generated (Cap) or real (No Cap).
                Earn points for correct guesses!
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-slate-100 border-2 border-cyan-300 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <Trophy className="w-8 h-8 text-cyan-700 mx-auto mb-2" />
                <p className="text-slate-900 font-black text-lg">
                  10 points = 1 free scan!
                </p>
              </div>
              <button
                onClick={startGame}
                disabled={isLoadingMedia || mediaPool.length === 0}
                className="bg-gradient-to-r from-slate-800 to-cyan-600 hover:from-slate-900 hover:to-cyan-700 text-white font-black py-4 px-12 rounded-full text-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoadingMedia ? 'Loading...' : mediaPool.length === 0 ? 'No Media Available' : 'Start Game'}
              </button>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="text-center py-20">
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-cyan-600 animate-pulse">
                {countdown}
              </div>
              <p className="text-xl text-gray-600 font-bold mt-6">Get ready...</p>
            </div>
          )}

          {gameState === 'playing' && currentMedia && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-800 to-cyan-600 rounded-2xl p-4 text-center">
                <p className="text-white font-black text-2xl">
                  {timeRemaining}s remaining
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                {currentMedia.type === 'image' ? (
                  <img
                    src={currentMedia.url}
                    alt="Guess this"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={currentMedia.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-center text-gray-600 font-bold">
                Study it carefully...
              </p>
            </div>
          )}

          {gameState === 'guessing' && currentMedia && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center opacity-50">
                {currentMedia.type === 'image' ? (
                  <img
                    src={currentMedia.url}
                    alt="Guess this"
                    className="w-full h-full object-cover blur-sm"
                  />
                ) : (
                  <video
                    src={currentMedia.url}
                    muted
                    className="w-full h-full object-cover blur-sm"
                  />
                )}
              </div>
              <h3 className="text-2xl font-black text-gray-900 text-center mb-6">
                What's your guess?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleGuess(true)}
                  className="bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-black py-6 px-8 rounded-2xl text-xl shadow-lg transition-all transform hover:scale-105"
                >
                  Cap
                  <div className="text-sm font-semibold mt-1">It's AI</div>
                </button>
                <button
                  onClick={() => handleGuess(false)}
                  className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-black py-6 px-8 rounded-2xl text-xl shadow-lg transition-all transform hover:scale-105"
                >
                  No Cap
                  <div className="text-sm font-semibold mt-1">It's Real</div>
                </button>
              </div>
            </div>
          )}

          {gameState === 'result' && currentMedia && (
            <div className="text-center py-8">
              {isCorrect ? (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-cyan-700 mb-4">
                    Correct!
                  </h3>
                  <p className="text-xl text-gray-700 font-bold mb-6">
                    {currentMedia.isAI ? 'It was AI-generated' : 'It was real'}
                  </p>
                  {earnedFreeScan ? (
                    <div className="bg-gradient-to-r from-slate-800 to-cyan-600 border-4 border-cyan-300 rounded-2xl p-6 mb-8 max-w-md mx-auto animate-pulse">
                      <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                      <p className="text-white font-black text-2xl mb-2">
                        Free Scan Earned!
                      </p>
                      <p className="text-white/90 font-semibold">
                        You hit 10 points and earned a free scan!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-cyan-50 border-2 border-cyan-300 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                      <p className="text-slate-900 font-black text-xl mb-2">
                        +1 Point
                      </p>
                      <p className="text-slate-700 font-semibold">
                        {10 - (gamePoints % 10)} more points until free scan
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <XCircle className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-red-600 mb-4">
                    Wrong!
                  </h3>
                  <p className="text-xl text-gray-700 font-bold mb-8">
                    {currentMedia.isAI ? 'It was AI-generated' : 'It was real'}
                  </p>
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                    <p className="text-red-900 font-bold">
                      No points this time. Try again!
                    </p>
                  </div>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={playAgain}
                  className="bg-gradient-to-r from-slate-800 to-cyan-600 hover:from-slate-900 hover:to-cyan-700 text-white font-black py-4 px-8 rounded-full text-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Play Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold py-4 px-8 rounded-full text-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
