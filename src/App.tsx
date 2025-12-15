import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-500 via-pink-400 to-orange-400 flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <Loader2 className="w-12 h-12 text-white animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main role="main">
      {user ? <Dashboard /> : <Auth />}
    </main>
  );
}

export default App;
