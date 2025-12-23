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
    const errorMessage = error.message || "Failed to extract media URL";
    const isUserError = errorMessage.includes('blocked') ||
                        errorMessage.includes('Login required') ||
                        errorMessage.includes('Could not extract');

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: isUserError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function extractInstagramMedia(url: string): Promise<string> {
  const attempts = [
    async () => await tryInstagramOembed(url),
    async () => await tryInstagramEmbed(url),
    async () => await tryInstagramDirect(url),
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error as Error;
      console.log('Attempt failed:', error);
    }
  }

  throw new Error(
    'Instagram blocked the request. Please download the image/video and upload the file directly instead.'
  );
}

async function tryInstagramOembed(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://graph.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);

    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return data.thumbnail_url;
      }
    }
  } catch (error) {
    console.log('OEmbed attempt failed');
  }
  return null;
}

async function tryInstagramEmbed(url: string): Promise<string | null> {
  try {
    let embedUrl = url;
    if (!url.includes('/embed')) {
      embedUrl = url.replace(/\/$/, '') + '/embed/';
    }

    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    if (html.includes('Sorry, this page') || html.includes('Login') || html.length < 1000) {
      return null;
    }

    const patterns = [
      /"video_url":"([^"]+)"/,
      /"display_url":"([^"]+)"/,
      /<meta property="og:video" content="([^"]+)"/,
      /<meta property="og:image" content="([^"]+)"/,
      /"thumbnail_src":"([^"]+)"/,
      /<meta property="og:video:secure_url" content="([^"]+)"/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      }
    }
  } catch (error) {
    console.log('Embed attempt failed');
  }
  return null;
}

async function tryInstagramDirect(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
  } catch (error) {
    console.log('Direct attempt failed');
  }
  return null;
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