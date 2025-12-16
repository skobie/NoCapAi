import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: import.meta.env
  });
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Scan = {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'image' | 'video';
  file_url: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence_score: number | null;
  is_ai_generated: boolean | null;
  artifacts: Array<{
    type: string;
    description: string;
    severity: string;
  }>;
  metadata: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
