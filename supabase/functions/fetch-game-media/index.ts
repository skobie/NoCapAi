import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PexelsVideo {
  id: number;
  video_files: Array<{
    link: string;
    quality: string;
    width: number;
    height: number;
  }>;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  isAI: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const pexelsApiKey = Deno.env.get('PEXELS_API_KEY');

    if (!pexelsApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Pexels API key not configured',
          code: 'MISSING_API_KEY'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch random photos from database
    const { data: photos, error: photosError } = await supabase
      .from('game_media')
      .select('url, type, is_ai')
      .eq('type', 'image')
      .eq('is_active', true)
      .limit(1000);

    if (photosError) {
      throw new Error(`Database error: ${photosError.message}`);
    }

    // Shuffle and take 25 random photos
    const shuffledPhotos = photos?.sort(() => Math.random() - 0.5).slice(0, 25) || [];
    const photoItems: MediaItem[] = shuffledPhotos.map(photo => ({
      url: photo.url,
      type: 'image' as const,
      isAI: photo.is_ai,
    }));

    // Fetch random videos from Pexels API
    const queries = [
      'nature',
      'city',
      'ocean',
      'wildlife',
      'technology',
      'people',
      'architecture',
      'food',
      'sports',
      'space',
      'mountains',
      'beach',
      'forest',
      'sunset',
      'abstract',
      'animals',
      'travel',
      'landscape'
    ];

    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const randomPage = Math.floor(Math.random() * 20) + 1;

    const videosResponse = await fetch(
      `https://api.pexels.com/videos/search?query=${randomQuery}&per_page=40&page=${randomPage}`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    if (!videosResponse.ok) {
      throw new Error(`Pexels API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();
    const videos = videosData.videos || [];

    const videoItems: MediaItem[] = videos
      .filter((video: PexelsVideo) => video.video_files && video.video_files.length > 0)
      .slice(0, 25)
      .map((video: PexelsVideo) => {
        const hdVideo = video.video_files.find((file) => 
          file.quality === 'hd' && file.width <= 1920
        ) || video.video_files[0];

        return {
          url: hdVideo.link,
          type: 'video' as const,
          isAI: Math.random() < 0.3,
        };
      });

    // Combine photos from DB and videos from Pexels
    const allMedia = [...photoItems, ...videoItems];

    if (allMedia.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No media found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Shuffle all media together
    for (let i = allMedia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allMedia[i], allMedia[j]] = [allMedia[j], allMedia[i]];
    }

    return new Response(
      JSON.stringify({ media: allMedia }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching game media:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
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
