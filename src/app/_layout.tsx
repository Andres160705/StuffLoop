import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

// La splash se queda hasta que la fuente esté lista (evita el salto de fuente)
SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fuentesListas || errorFuentes) {
      SplashScreen.hideAsync();
    }
  }, [fuentesListas, errorFuentes]);

  // Si la fuente falla, la app sigue con la del sistema
  if (!fuentesListas && !errorFuentes) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
