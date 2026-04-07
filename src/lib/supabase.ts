import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseCredentials } from "../config/env";

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackPublicKey = "placeholder-publishable-key";

export const supabase = createClient(
  env.supabaseUrl || fallbackUrl,
  env.supabasePublicKey || fallbackPublicKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: hasSupabaseCredentials,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
