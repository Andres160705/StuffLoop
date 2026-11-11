import { CatalogoHeader } from "@/components/CatalogoHeader";
import { ObjetoImagen } from "@/components/ObjetoImagen";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { objetosService } from "../../services/objetosService";
import { Objeto } from "../../types/objeto";

// En pantallas grandes (tablet/web) el contenido se centra en una columna tipo móvil
const ANCHO_MAXIMO = 640;

export default function DetalleObjeto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    }
  }, [id]);

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      const data = await objetosService.obtenerPorId(id as string);
      setObjeto(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información del objeto.");
      router.back();
    } finally {
      setCargando(false);
    }
  };

  const solicitarObjeto = () => {
    Alert.alert(
      "Funcion en desarrollo",
      `Funcion en desarrollo pronto se podra enviar una solicitud`,
    );
  };

  // La imagen principal escala con el ancho de pantalla (55% del ancho, con tope)
  const altoImagen = Math.round(Math.min(width, ANCHO_MAXIMO) * 0.55);

  return (
    <View style={styles.container}>
      {/* Header propio: empuja el contenido, no se superpone */}
      <CatalogoHeader title={objeto?.titulo || "Detalle"} mostrarAtras />

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !objeto ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
          <Text style={styles.noEncontrado}>Objeto no encontrado.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contenido}
        >
          <ObjetoImagen
            uri={objeto.imagenUrl}
            style={[styles.image, { height: altoImagen }]}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{objeto.titulo}</Text>
              <Text
                style={[
                  styles.badge,
                  objeto.tipo === "prestamo"
                    ? styles.badgePrestamo
                    : styles.badgeIntercambio,
                ]}
              >
                {objeto.tipo ? objeto.tipo.toUpperCase() : "GENERAL"}
              </Text>
            </View>

            <Text style={styles.category}>Categoría: {objeto.categoria}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{objeto.descripcion}</Text>

            <Text style={styles.sectionTitle}>Condiciones de entrega</Text>
            <Text style={styles.description}>
              {objeto.condiciones || "Sin condiciones específicas."}
            </Text>

            <View style={styles.divider} />

            <View style={styles.ownerCard}>
              <Text style={styles.ownerTitle}>Publicado por</Text>
              <Text style={styles.ownerName}>{objeto.usuarioNombre}</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={solicitarObjeto}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {objeto.tipo === "prestamo"
                  ? "Solicitar Préstamo"
                  : "Proponer Intercambio"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scroll: { flex: 1 },
  // Columna centrada con ancho máximo: en móvil ocupa todo el ancho
  contenido: { width: "100%", maxWidth: ANCHO_MAXIMO, alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  noEncontrado: { color: "#64748B", fontSize: 15 },
  image: { width: "100%", backgroundColor: "#E2E8F0" },
  content: { padding: 20, paddingBottom: 32 },
  // "wrap" para que el badge baje de línea en títulos largos
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F172A", flexShrink: 1 },
  badge: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#FFF",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  badgePrestamo: { backgroundColor: Colors.badgePrestamo },
  badgeIntercambio: { backgroundColor: Colors.badgeIntercambio },
  category: { fontSize: 14, color: "#64748B", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 6,
  },
  description: { fontSize: 15, color: "#475569", lineHeight: 22 },
  ownerCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  ownerTitle: { fontSize: 12, color: "#64748B" },
  ownerName: { fontSize: 16, fontWeight: "bold", color: "#0F172A" },
  // Altura táctil mínima de 54px para el botón principal
  button: {
    backgroundColor: Colors.primary,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
