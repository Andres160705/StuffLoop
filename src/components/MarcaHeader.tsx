import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Header de las pantallas principales (Explorar, Intercambio, Mi perfil):
 * logo cuadrado verde + "StuffLoop" + saludo, y el avatar a la derecha.
 * La ubicación/distancia del diseño queda para un próximo avance.
 */
export function MarcaHeader() {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const completo: string =
        user?.user_metadata?.nombre || user?.user_metadata?.full_name || "";
      setNombre(completo.split(" ")[0]);
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.logo}>
        <Ionicons name="repeat" size={26} color="#FFF" />
      </View>
      <View style={styles.textos}>
        <Text style={styles.marca}>StuffLoop</Text>
        <Text style={styles.saludo} numberOfLines={1}>
          {nombre ? `Hola, ${nombre}` : "Presta e intercambia con tus vecinos"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  textos: { flex: 1, marginLeft: 12, marginRight: 12 },
  marca: { fontFamily: Fonts.extrabold, fontSize: 20, color: Colors.primary },
  saludo: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.8,
  },
});
