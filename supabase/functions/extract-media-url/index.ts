import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  url: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url }: RequestBody = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let mediaUrl = url;

    if (url.includes('instagram.com')) {
      mediaUrl = await extractInstagramMedia(url);
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      mediaUrl = await extractTwitterMedia(url);
    } else if (url.includes('tiktok.com')) {
      mediaUrl = await extractTikTokMedia(url);
    }

    return new Response(
      JSON.stringify({ mediaUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error extracting media URL:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to extract media URL" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function extractInstagramMedia(url: string): Promise<string> {
  try {
    // Try to add embed to URL for better access
    let embedUrl = url;
    if (!url.includes('/embed')) {
      embedUrl = url.replace(/\/$/, '') + '/embed/';
    }

    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Instagram returned status ${response.status}`);
    }

    const html = await response.text();

    // Try multiple extraction patterns
    const patterns = [
      /"video_url":"([^"]+)"/,
      /"display_url":"([^"]+)"/,
      /<meta property="og:video" content="([^"]+)"/,
      /<meta property="og:image" content="([^"]+)"/,
      /"thumbnail_src":"([^"]+)"/,
      /<meta property="og:video:secure_url" content="([^"]+)"/,
      /<video[^>]+src="([^"]+)"/,
      /<img[^>]+src="([^"]+)"[^>]*class="[^"]*FFVAD[^"]*"/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      }
    }

    // If no match found, check if we got blocked
    if (html.includes('Sorry, this page') || html.includes('Login') || html.length < 1000) {
      throw new Error('Instagram blocked the request. Please try uploading the image/video file directly instead.');
    }

    throw new Error('Could not extract media URL from Instagram post. Try uploading the file directly.');
  } catch (error) {
    console.error('Instagram extraction error:', error);
    throw error;
  }
}

async function extractTwitterMedia(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const html = await response.text();

  const ogVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
  if (ogVideoMatch) {
    return ogVideoMatch[1];
  }

  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/);
  if (twitterImageMatch) {
    return twitterImageMatch[1];
  }

  throw new Error('Could not extract media URL from Twitter/X post');
}

async function extractTikTokMedia(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const html = await response.text();

  const ogVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
  if (ogVideoMatch) {
    return ogVideoMatch[1];
  }

  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  throw new Error('Could not extract media URL from TikTok post');
}