import { supabase } from "@/supabase";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<boolean> {
  // Misma URL de redirect que ya estaba configurada en Supabase/Google:
  // 'stuffloop://...' en builds nativas, 'exp://...' en Expo Go
  const redirectTo = makeRedirectUri({ scheme: "stuffloop" });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url)
    throw error ?? new Error("No se obtuvo la URL de Google");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return false; // el usuario canceló

  const url = result.url;

  // Flujo implícito: tokens en el fragmento (#access_token=...)
  const fragment = url.split("#")[1];
  if (fragment) {
    const params = new URLSearchParams(fragment);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) throw sessionError;
      return true;
    }
  }

  // Flujo PKCE: código en la query (?code=...)
  const query = url.split("?")[1]?.split("#")[0];
  const code = query ? new URLSearchParams(query).get("code") : null;
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return true;
  }

  return false;
}
