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
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const html = await response.text();

  const videoMatch = html.match(/"video_url":"([^"]+)"/);
  if (videoMatch) {
    return videoMatch[1].replace(/\\u0026/g, '&');
  }

  const imageMatch = html.match(/"display_url":"([^"]+)"/);
  if (imageMatch) {
    return imageMatch[1].replace(/\\u0026/g, '&');
  }

  const ogVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
  if (ogVideoMatch) {
    return ogVideoMatch[1];
  }

  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  throw new Error('Could not extract media URL from Instagram post');
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