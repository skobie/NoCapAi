import { ArrowLeft, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Scan } from '../lib/supabase';

type Props = {
  scan: Scan;
  onBack: () => void;
};

export default function ScanResults({ scan, onBack }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-red-100';
    if (score >= 50) return 'bg-orange-100';
    if (score >= 25) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getVerdict = (score: number) => {
    if (score >= 75) return 'Very Likely AI-Generated';
    if (score >= 50) return 'Possibly AI-Generated';
    if (score >= 25) return 'Unlikely AI-Generated';
    return 'Likely Authentic';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const confidenceScore = scan.confidence_score || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-500/30 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}>
                Scan Results
              </h2>
              <p className="text-sm sm:text-base text-cyan-300 break-all">{scan.file_name}</p>
              <p className="text-xs sm:text-sm text-cyan-400/70 mt-1">
                {new Date(scan.created_at).toLocaleString()}
              </p>
            </div>
            {scan.file_type === 'image' && (
              <img
                src={scan.file_url}
                alt={scan.file_name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-cyan-500/30 flex-shrink-0"
              />
            )}
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-300">Confidence Score</h3>
              <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(confidenceScore)}`}>
                {confidenceScore.toFixed(1)}%
              </span>
            </div>

            <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden mb-3">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  confidenceScore >= 75
                    ? 'bg-red-500'
                    : confidenceScore >= 50
                    ? 'bg-orange-500'
                    : confidenceScore >= 25
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>

            <div
              className={`${getScoreBgColor(confidenceScore)} bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border ${
                confidenceScore >= 75
                  ? 'border-red-500/30'
                  : confidenceScore >= 50
                  ? 'border-orange-500/30'
                  : confidenceScore >= 25
                  ? 'border-yellow-500/30'
                  : 'border-green-500/30'
              }`}
            >
              {scan.is_ai_generated ? (
                <AlertTriangle className={`w-6 h-6 ${getScoreColor(confidenceScore)}`} />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              <div>
                <p className={`font-semibold ${getScoreColor(confidenceScore)}`}>
                  {getVerdict(confidenceScore)}
                </p>
                <p className="text-sm text-cyan-400/70 mt-1">
                  {scan.is_ai_generated
                    ? 'This content shows indicators of being AI-generated'
                    : 'This content appears to be authentic'}
                </p>
              </div>
            </div>
          </div>

          {scan.artifacts && scan.artifacts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Detected Indicators</h3>
              <div className="space-y-3">
                {scan.artifacts.map((artifact, index) => (
                  <div
                    key={index}
                    className="border border-cyan-500/30 bg-slate-800/50 rounded-lg p-4 flex items-start gap-3 hover:bg-slate-800/70 transition-colors"
                  >
                    {getSeverityIcon(artifact.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white capitalize">
                          {artifact.type.replace(/_/g, ' ')}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            artifact.severity === 'high'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : artifact.severity === 'medium'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {artifact.severity}
                        </span>
                      </div>
                      <p className="text-sm text-cyan-400/70">{artifact.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-cyan-500/30 pt-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-cyan-400/70 mb-1">File Name</p>
                <p className="font-medium text-white break-all">{scan.file_name}</p>
              </div>
              <div>
                <p className="text-cyan-400/70 mb-1">File Type</p>
                <p className="font-medium text-white uppercase">{scan.file_type}</p>
              </div>
              <div>
                <p className="text-cyan-400/70 mb-1">File Size</p>
                <p className="font-medium text-white">
                  {(scan.file_size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-cyan-400/70 mb-1">Analysis Status</p>
                <p className="font-medium text-white capitalize">{scan.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 px-8 py-6 border-t border-cyan-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-400/70">
              <p className="font-medium mb-1 text-cyan-300">About This Analysis</p>
              <p>
                This analysis uses advanced AI detection algorithms to identify patterns and
                artifacts. Results should be used as a reference and combined with other
                verification methods for critical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
