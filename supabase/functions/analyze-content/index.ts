import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const TOKENS_PER_SCAN = 100;
const FREE_SCANS_LIMIT = 3;

function mockAiDetection(fileUrl: string, fileType: string) {
  const hash = Array.from(fileUrl).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const confidenceScore = 30 + (hash % 65);
  
  const possibleModels = [
    { name: 'DALL-E', baseConfidence: 75 },
    { name: 'Midjourney', baseConfidence: 82 },
    { name: 'Stable Diffusion', baseConfidence: 68 },
    { name: 'Adobe Firefly', baseConfidence: 71 },
    { name: 'Unknown AI Model', baseConfidence: 55 }
  ];
  
  const detectedModels = [];
  const isAiGenerated = confidenceScore > 50;
  
  if (isAiGenerated) {
    const modelIndex = hash % possibleModels.length;
    const selectedModel = possibleModels[modelIndex];
    const variance = (hash % 20) - 10;
    
    detectedModels.push({
      name: selectedModel.name,
      confidence: Math.min(95, Math.max(50, selectedModel.baseConfidence + variance))
    });
  }
  
  const artifacts = [];
  
  if (isAiGenerated && detectedModels.length > 0) {
    artifacts.push({
      type: 'ai_model_detection',
      description: `Detected AI-generated content from: ${detectedModels.map(m => m.name).join(', ')}`,
      severity: 'high',
      models: detectedModels,
    });
  }
  
  if (confidenceScore > 70) {
    artifacts.push({
      type: 'high_confidence',
      description: 'Very high confidence of AI generation detected',
      severity: 'high',
    });
  } else if (confidenceScore > 50) {
    artifacts.push({
      type: 'medium_confidence',
      description: 'Moderate indicators of AI generation detected',
      severity: 'medium',
    });
  } else {
    artifacts.push({
      type: 'low_confidence',
      description: 'Low probability of AI generation - likely authentic',
      severity: 'low',
    });
  }
  
  return {
    confidenceScore,
    isAiGenerated,
    artifacts,
    detectedModels
  };
}

async function fetchMediaFromUrl(url: string): Promise<{ blob: Blob; contentType: string; fileName: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error('Access denied. Please right-click the image and select "Copy Image Address" to get the direct image URL, not the post URL.');
      }
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    if (!contentType.includes('image') && !contentType.includes('video')) {
      throw new Error('URL does not point to an image or video. Please provide a direct link to media content.');
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded file is empty. Please check the URL.');
    }

    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('mp4')) extension = 'mp4';
    else if (contentType.includes('webm')) extension = 'webm';
    else if (contentType.includes('jpeg')) extension = 'jpg';

    const fileName = `url_scan_${Date.now()}.${extension}`;

    return { blob, contentType, fileName };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to download media from URL. Please ensure the URL is accessible and points directly to an image or video.');
  }
}

function isValidMediaUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  let scanId: string | undefined;

  try {
    const requestData = await req.json();
    const sourceUrl = requestData.sourceUrl;
    let fileUrl = requestData.fileUrl;
    let fileType = requestData.fileType;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    let userId: string;

    if (sourceUrl) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        throw new Error('Unauthorized');
      }

      userId = user.id;

      if (!isValidMediaUrl(sourceUrl)) {
        throw new Error('Invalid URL provided. Please provide a valid image or video URL.');
      }

      try {
        const { blob, contentType, fileName } = await fetchMediaFromUrl(sourceUrl);

        const filePathInStorage = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('scans')
          .upload(filePathInStorage, blob, {
            contentType,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('scans')
          .getPublicUrl(filePathInStorage);

        fileUrl = publicUrl;
        fileType = contentType.startsWith('image/') ? 'image' : 'video';

        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .insert({
            user_id: userId,
            file_name: fileName,
            file_type: fileType,
            file_url: publicUrl,
            file_size: blob.size,
            status: 'pending',
          })
          .select()
          .single();

        if (scanError) throw scanError;

        scanId = scanData.id;
      } catch (error) {
        throw new Error(`Failed to fetch media: ${error.message}`);
      }
    } else {
      scanId = requestData.scanId;

      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .select('user_id')
        .eq('id', scanId)
        .single();

      if (scanError || !scan) {
        return new Response(
          JSON.stringify({ error: 'Scan not found' }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      userId = scan.user_id;
    }

    const { data: tokenBalance, error: balanceError } = await supabase
      .from('token_balances')
      .select('balance, free_scans_used, total_scans')
      .eq('user_id', userId)
      .maybeSingle();

    if (balanceError) {
      return new Response(
        JSON.stringify({ error: 'Failed to check token balance' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const currentBalance = tokenBalance?.balance || 0;
    const freeScansUsed = tokenBalance?.free_scans_used || 0;
    const totalScans = tokenBalance?.total_scans || 0;
    const isFreeScansAvailable = freeScansUsed < FREE_SCANS_LIMIT;

    if (!isFreeScansAvailable && currentBalance < TOKENS_PER_SCAN) {
      await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      return new Response(
        JSON.stringify({
          error: 'Insufficient tokens',
          code: 'INSUFFICIENT_TOKENS',
          currentBalance,
          required: TOKENS_PER_SCAN
        }),
        {
          status: 402,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await supabase
      .from('scans')
      .update({ status: 'processing' })
      .eq('id', scanId);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis = mockAiDetection(fileUrl, fileType);

    let newBalance = currentBalance;
    let newFreeScansUsed = freeScansUsed;
    let newTotalScans = totalScans + 1;

    if (!isFreeScansAvailable) {
      newBalance = currentBalance - TOKENS_PER_SCAN;
    } else {
      newFreeScansUsed = freeScansUsed + 1;
    }

    await supabase
      .from('token_balances')
      .update({
        balance: newBalance,
        free_scans_used: newFreeScansUsed,
        total_scans: newTotalScans,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (!isFreeScansAvailable) {
      await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          type: 'deduction',
          amount: -TOKENS_PER_SCAN,
          balance_after: newBalance,
          description: `Content scan: ${fileType}`,
          scan_id: scanId,
        });
    }

    const metadata = {
      analyzed_at: new Date().toISOString(),
      file_type: fileType,
      analysis_version: '2.0-mock',
      tokens_used: isFreeScansAvailable ? 0 : TOKENS_PER_SCAN,
      was_free_scan: isFreeScansAvailable,
      free_scans_remaining: FREE_SCANS_LIMIT - newFreeScansUsed,
      detection_method: 'mock_testing'
    };

    await supabase
      .from('scans')
      .update({
        status: 'completed',
        confidence_score: analysis.confidenceScore,
        is_ai_generated: analysis.isAiGenerated,
        artifacts: analysis.artifacts,
        metadata,
      })
      .eq('id', scanId);

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        tokensRemaining: newBalance,
        wasFreeScans: isFreeScansAvailable,
        freeScansRemaining: FREE_SCANS_LIMIT - newFreeScansUsed
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error analyzing content:', error);

    if (scanId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('scans')
          .update({
            status: 'failed',
            error_message: error.message || 'Analysis failed'
          })
          .eq('id', scanId);
      } catch (updateError) {
        console.error('Failed to update scan status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});