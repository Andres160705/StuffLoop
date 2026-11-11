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
import { Fonts } from "../../constants/fonts";
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

  const esPrestamo = objeto?.tipo !== "intercambio";

  // La imagen principal escala con el ancho de pantalla (55% del ancho, con tope)
  const altoImagen = Math.round((Math.min(width, ANCHO_MAXIMO) - 56) * 0.75);

  return (
    <View style={styles.container}>
      {/* Header propio: empuja el contenido, no se superpone */}
      <CatalogoHeader title="Detalle del objeto" mostrarAtras />

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !objeto ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color={Colors.muted} />
          <Text style={styles.noEncontrado}>Objeto no encontrado.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contenido}
        >
          <View style={styles.card}>
            <ObjetoImagen
              uri={objeto.imagenUrl}
              style={[styles.image, { height: altoImagen }]}
            />

            <View style={styles.etiquetas}>
              <View style={styles.etiqueta}>
                <Ionicons
                  name={esPrestamo ? "calendar-outline" : "swap-horizontal-outline"}
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.etiquetaTexto}>
                  {esPrestamo ? "Préstamo" : "Intercambio"}
                </Text>
              </View>
              <View style={styles.etiqueta}>
                <Text style={styles.etiquetaTexto}>{objeto.categoria}</Text>
              </View>
            </View>

            <Text style={styles.title}>{objeto.titulo}</Text>

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{objeto.descripcion}</Text>

            <Text style={styles.sectionTitle}>Condiciones de entrega</Text>
            <Text style={styles.description}>
              {objeto.condiciones || "Sin condiciones específicas."}
            </Text>

            {!!objeto.diasMaxPrestamo && esPrestamo && (
              <>
                <Text style={styles.sectionTitle}>Tiempo máximo de préstamo</Text>
                <Text style={styles.description}>
                  {objeto.diasMaxPrestamo}{" "}
                  {objeto.diasMaxPrestamo === 1 ? "día" : "días"}
                </Text>
              </>
            )}

            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInicial}>
                  {(objeto.usuarioNombre || "V").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerTitle}>Publicado por</Text>
                <Text style={styles.ownerName}>{objeto.usuarioNombre}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={solicitarObjeto}
              activeOpacity={0.8}
            >
              <Ionicons
                name={esPrestamo ? "calendar-outline" : "swap-horizontal-outline"}
                size={20}
                color="#FFF"
              />
              <Text style={styles.buttonText}>
                {esPrestamo ? "Solicitar préstamo" : "Proponer intercambio"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  // Columna centrada con ancho máximo: en móvil ocupa todo el ancho
  contenido: {
    width: "100%",
    maxWidth: ANCHO_MAXIMO,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  noEncontrado: { fontFamily: Fonts.regular, color: Colors.textSoft, fontSize: 15 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 12 },
  image: { width: "100%", borderRadius: 12, backgroundColor: Colors.background },
  etiquetas: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  etiquetaTexto: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.primary },
  title: {
    fontFamily: Fonts.extrabold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.text,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.text,
    marginTop: 18,
    marginBottom: 4,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textSoft,
    lineHeight: 23,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.inputBg,
    padding: 12,
    borderRadius: 12,
    marginTop: 22,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerInicial: { fontFamily: Fonts.bold, fontSize: 18, color: "#FFF" },
  ownerTitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSoft },
  ownerName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  // Altura táctil mínima de 54px para el botón principal
  button: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.primary,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: { fontFamily: Fonts.bold, color: "#FFF", fontSize: 16 },
});
