import { useEffect, useState } from 'react';
import { Trash2, Eye, Image, Video, Loader2, AlertCircle } from 'lucide-react';
import { supabase, Scan } from '../lib/supabase';

type Props = {
  onViewScan: (scan: Scan) => void;
};

export default function ScanHistory({ onViewScan }: Props) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this scan?')) return;

    setDeletingId(scanId);
    try {
      const filePath = fileUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('scans').remove([filePath]);

      const { error } = await supabase.from('scans').delete().eq('id', scanId);

      if (error) throw error;

      setScans(scans.filter((scan) => scan.id !== scanId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete scan');
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    if (score >= 25) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900">Error loading scans</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No scans yet</h3>
        <p className="text-gray-600">
          Upload your first image or video to detect AI-generated content
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
          Your Scans
        </h2>
        <p className="text-white/80 font-semibold">View and manage all your scans</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                {scan.file_type === 'image' ? (
                  <img
                    src={scan.file_url}
                    alt={scan.file_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate mb-1">
                        {scan.file_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {scan.status === 'completed' && scan.confidence_score !== null && (
                      <div
                        className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm flex-shrink-0 ${getScoreColor(
                          scan.confidence_score
                        )}`}
                      >
                        {scan.confidence_score.toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {scan.status === 'completed' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          scan.is_ai_generated ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {scan.is_ai_generated ? 'Likely AI-Generated' : 'Likely Authentic'}
                      </span>
                    </div>
                  )}

                  {scan.status === 'processing' && (
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Analyzing...</span>
                    </div>
                  )}

                  {scan.status === 'failed' && (
                    <div className="flex items-center gap-2 text-red-600 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Analysis failed</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onViewScan(scan)}
                      disabled={scan.status !== 'completed'}
                      className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full font-bold text-sm sm:text-base transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(scan.id, scan.file_url)}
                      disabled={deletingId === scan.id}
                      className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-red-400 hover:bg-red-50 text-red-600 rounded-full font-bold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === scan.id ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
