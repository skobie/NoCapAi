import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LegalAgreement from './components/LegalAgreement';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'en';
    const accepted = localStorage.getItem('legal-agreement-accepted') === 'true';
    setHasAcceptedLegal(accepted);
  }, []);

  const handleLegalAccept = () => {
    setHasAcceptedLegal(true);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen galaxy-bg flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <div className="galaxy-content">
          <Loader2 className="w-12 h-12 text-cyan-300 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user && !hasAcceptedLegal) {
    return (
      <main role="main" className="galaxy-bg">
        <LegalAgreement onAccept={handleLegalAccept} />
      </main>
    );
  }

  return (
    <main role="main" className="galaxy-bg">
      {user ? <Dashboard /> : <Auth />}
    </main>
  );
}

export default App;
