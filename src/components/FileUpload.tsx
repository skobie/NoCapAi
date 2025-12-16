import { useState, useRef, useEffect } from 'react';
import { Upload, Image, Video, AlertCircle, Loader2, CheckCircle, Shield } from 'lucide-react';
import { supabase, Scan } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { trackScan } from '../lib/analytics';

type Props = {
  onScanComplete: (scan: Scan, tokensRemaining?: number, freeScansRemaining?: number) => void;
  onInsufficientTokens?: () => void;
};

export default function FileUpload({ onScanComplete, onInsufficientTokens }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [freeScansRemaining, setFreeScansRemaining] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchFreeScans();
  }, [user]);

  const fetchFreeScans = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('token_balances')
      .select('free_scans_used')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setFreeScansRemaining(3 - (data.free_scans_used || 0));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const maxSize = 50 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP) or video (MP4, WebM) file');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Check token balance and free scans before uploading
      const { data: tokenData } = await supabase
        .from('token_balances')
        .select('balance, free_scans_used')
        .eq('user_id', user.id)
        .maybeSingle();

      const hasFreeScans = (tokenData?.free_scans_used || 0) < 3;
      const hasTokens = (tokenData?.balance || 0) >= 100;

      if (!hasFreeScans && !hasTokens) {
        setUploading(false);
        if (onInsufficientTokens) {
          onInsufficientTokens();
        }
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('scans')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('scans')
        .getPublicUrl(fileName);

      const fileType = file.type.startsWith('image/') ? 'image' : 'video';

      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          status: 'pending',
        })
        .select()
        .single();

      if (scanError) throw scanError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          scanId: scanData.id,
          fileUrl: publicUrl,
          fileType,
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json();

        // Clean up: delete the scan record and uploaded file
        await supabase
          .from('scans')
          .delete()
          .eq('id', scanData.id);

        await supabase.storage
          .from('scans')
          .remove([fileName]);

        setUploading(false);
        setFile(null);
        setPreview(null);
        if (onInsufficientTokens) {
          onInsufficientTokens();
        } else {
          setError('Insufficient tokens. Please purchase more tokens to continue scanning.');
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const analysisResult = await response.json();

      const pollResult = async () => {
        const { data: updatedScan } = await supabase
          .from('scans')
          .select()
          .eq('id', scanData.id)
          .single();

        if (updatedScan?.status === 'completed') {
          trackScan(fileType);
          onScanComplete(
            updatedScan as Scan,
            analysisResult.tokensRemaining,
            analysisResult.freeScansRemaining
          );
          setFreeScansRemaining(analysisResult.freeScansRemaining || 0);
          setFile(null);
          setPreview(null);
          setUploading(false);
        } else if (updatedScan?.status === 'failed') {
          throw new Error(updatedScan.error_message || 'Analysis failed');
        } else {
          setTimeout(pollResult, 2000);
        }
      };

      setTimeout(pollResult, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3" style={{ textShadow: '2px 2px 0px rgba(255,192,203,0.3)' }}>
            Scan Your Media
          </h2>
          <p className="text-gray-700 font-semibold text-sm sm:text-base md:text-lg">
            Upload to detect AI-generated content
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 sm:border-4 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
            }`}
          >
            <Upload className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 text-pink-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-lg sm:text-xl font-black text-gray-900 mb-2">
              Drop your file here
            </p>
            <p className="text-sm sm:text-base font-semibold text-gray-600 mb-3 sm:mb-4">
              Images (JPEG, PNG, WebP) • Videos (MP4, WebM)
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Max 50MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    ) : (
                      <Video className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {uploading && (
                    <div className="mt-2 sm:mt-3 flex items-center gap-2 text-pink-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs sm:text-sm font-medium">Analyzing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-3 sm:py-4 px-6 rounded-full text-base sm:text-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Start Scan
                  </>
                )}
              </button>
              {!uploading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setError(null);
                  }}
                  className="px-6 py-3 sm:py-4 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-full transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 text-center shadow-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-black text-gray-900 mb-1 text-lg">Advanced AI</h3>
          <p className="text-sm text-gray-600 font-semibold">
            Multiple detection algorithms
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 text-center shadow-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-black text-gray-900 mb-1 text-lg">Instant Results</h3>
          <p className="text-sm text-gray-600 font-semibold">
            Get confidence scores fast
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 text-center shadow-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-black text-gray-900 mb-1 text-lg">Full History</h3>
          <p className="text-sm text-gray-600 font-semibold">
            Review all past scans
          </p>
        </div>
      </div>
    </div>
  );
}
