/** Minimal runtime-validated environment access. Never throws at import time. */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requiredEnv(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return read(name);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(read('NEXT_PUBLIC_SUPABASE_URL') && read('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}

export function isJudgeConfigured(): boolean {
  return Boolean(read('JUDGE0_BASE_URL'));
}

export function isAiConfigured(): boolean {
  return Boolean(read('OPENROUTER_API_KEY'));
}

/** Public config safe to embed in the browser bundle. */
export const publicEnv = {
  supabaseUrl: read('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: read('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;