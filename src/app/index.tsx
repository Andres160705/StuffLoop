import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { Colors } from "@/constants/colors";
import { supabase } from "@/supabase";

export default function Index() {
  const [cargando, setCargando] = useState(true);
  const [tieneSesion, setTieneSesion] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setTieneSesion(Boolean(data.session));
      setCargando(false);
    });
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Con sesión activa se entra directo al catálogo; si no, al login
  return <Redirect href={tieneSesion ? "/catalogo" : "/login"} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
