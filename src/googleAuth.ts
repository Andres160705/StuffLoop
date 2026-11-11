import { supabase } from "@/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

/** Resultado del intento de login con Google */
export interface ResultadoGoogle {
  /** La sesión quedó iniciada en Supabase */
  exito: boolean;
  /**
   * URL de retorno que usó el flujo. Debe estar en Supabase →
   * Authentication → URL Configuration → Redirect URLs, porque si no,
   * Supabase ignora el retorno y manda el navegador al Site URL.
   */
  redirectUri: string;
  /** El usuario cerró el navegador él mismo (no es un error del flujo) */
  cancelado: boolean;
  /** Mensaje de error si el flujo falló por un motivo conocido */
  mensaje?: string;
}

export async function signInWithGoogle(): Promise<ResultadoGoogle> {
  // En Expo Go el scheme "stuffloop" se IGNORA y la URL real sería exp://IP:PUERTO.
  // PROBLEMA: Supabase RECHAZA redirects hacia IPs privadas (exp://192.168.x.x)
  // aunque estén en la lista blanca (chequeo anti-SSRF en su servidor) — por eso
  // Safari siempre terminaba en el fallback localhost.
  // SOLUCIÓN: preferLocalhost envía exp://localhost:8081, que sí pasa el chequeo.
  // Safari NO intenta conectarse a localhost: la sesión de auth intercepta el
  // retorno por el scheme "exp" antes de resolver el host.
  // En un build nativo (EAS) el scheme sí es stuffloop://.
  //
  // ANDROID: el truco de localhost NO sirve. Android no intercepta el retorno
  // como iOS; le pasa exp://localhost:8081 a Expo Go, que lo trata como OTRO
  // proyecto y la app nunca recibe los tokens (el botón se queda cargando).
  // Ahí usamos la URL real del proyecto que está corriendo
  // (exp://IP:PUERTO/--/auth-callback), que Expo Go sí le entrega a la app.
  // Si Supabase la rechazara por ser IP privada, arrancar con
  // `npx expo start --tunnel` (la URL queda como exp://xxxx.exp.direct).
  const redirectTo =
    Platform.OS === "android"
      ? Linking.createURL("auth-callback")
      : makeRedirectUri({
          scheme: "stuffloop",
          preferLocalhost: true,
        });
  console.log(
    "[Google] URL de retorno (agregar en Supabase → Authentication → URL Configuration):",
    redirectTo
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) {
    return {
      exito: false,
      redirectUri: redirectTo,
      cancelado: false,
      mensaje: error?.message ?? "No se obtuvo la URL de Google",
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") {
    // El navegador quedó atascado (p. ej. en localhost porque Supabase
    // rechazó la URL de retorno) y el usuario tuvo que cerrarlo
    console.log("[Google] el navegador cerró sin retornar:", result.type);
    return { exito: false, redirectUri: redirectTo, cancelado: true };
  }

  const url = result.url;

  // Flujo implícito: tokens en el fragmento (#access_token=...)
  const fragment = url.split("#")[1];
  if (fragment) {
    const params = new URLSearchParams(fragment);

    // Supabase devuelve los fallos en el fragmento (#error_description=...)
    const mensajeError =
      params.get("error_description") || params.get("error");
    if (mensajeError) {
      return {
        exito: false,
        redirectUri: redirectTo,
        cancelado: false,
        mensaje: mensajeError,
      };
    }

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) {
        return {
          exito: false,
          redirectUri: redirectTo,
          cancelado: false,
          mensaje: sessionError.message,
        };
      }
      return { exito: true, redirectUri: redirectTo, cancelado: false };
    }
  }

  // PKCE: código de autorización en el query (?code=...)
  const query = url.split("?")[1]?.split("#")[0];
  const code = query ? new URLSearchParams(query).get("code") : null;
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return {
        exito: false,
        redirectUri: redirectTo,
        cancelado: false,
        mensaje: exchangeError.message,
      };
    }
    return { exito: true, redirectUri: redirectTo, cancelado: false };
  }

  return {
    exito: false,
    redirectUri: redirectTo,
    cancelado: false,
    mensaje: "Google devolvió a la app sin tokens de sesión",
  };
}
