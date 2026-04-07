type EnvShape = Record<string, string | undefined>;

const processEnv =
  (globalThis as typeof globalThis & { process?: { env?: EnvShape } }).process?.env ?? {};

export const env = {
  supabaseUrl: processEnv.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabasePublicKey:
    processEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    processEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "",
};

export const hasSupabaseCredentials = Boolean(
  env.supabaseUrl && env.supabasePublicKey
);
