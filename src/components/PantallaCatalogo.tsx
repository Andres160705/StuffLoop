import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { objetosService } from '@/services/objetosService';
import { Objeto } from '@/types/objeto';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { CATEGORIAS_FILTRO } from '@/constants/categorias';
import { MarcaHeader } from '@/components/MarcaHeader';
import { TarjetaObjeto } from '@/components/TarjetaObjeto';
import { BarraInferior } from '@/components/BarraInferior';

// En pantallas grandes (tablet/web) el contenido se centra en una columna tipo móvil
const ANCHO_MAXIMO = 560;

interface PantallaCatalogoProps {
  /** "intercambio" muestra solo los objetos que se ofrecen para trueque */
  modo: 'explorar' | 'intercambio';
}

/**
 * Pantalla de listado compartida por Explorar (catalogo/index) e
 * Intercambio (catalogo/intercambio): header de marca, buscador, chips de
 * categoría, tarjetas en una columna y la barra inferior.
 */
export function PantallaCatalogo({ modo }: PantallaCatalogoProps) {
  const { width } = useWindowDimensions();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // "actualizar" cambia cuando se publica un objeto y se quiere refrescar la lista
  const { actualizar } = useLocalSearchParams<{ actualizar?: string }>();

  useEffect(() => {
    // Debounce: espera 400ms tras el último cambio antes de consultar Supabase
    const temporizador = setTimeout(() => {
      cargarObjetos();
    }, 400);

    return () => clearTimeout(temporizador);
  }, [categoriaSeleccionada, busqueda, actualizar]);

  const cargarObjetos = async () => {
    try {
      setCargando(true);
      const data = await objetosService.obtenerObjetos(categoriaSeleccionada, busqueda);
      setObjetos(modo === 'intercambio' ? data.filter((o) => o.tipo === 'intercambio') : data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // La foto de cada tarjeta escala con el ancho de la columna
  const anchoTarjeta = Math.min(width, ANCHO_MAXIMO) - 32 - 24;
  const altoImagen = Math.round(anchoTarjeta * 0.62);

  const titulo = modo === 'intercambio' ? 'Disponibles para intercambio' : 'Artículos disponibles';
  const textoVacio =
    modo === 'intercambio'
      ? 'Nadie ha publicado objetos para intercambio con estos filtros. Publica el tuyo con el botón +.'
      : 'No hay objetos con estos filtros. Prueba otra categoría o publica el tuyo con el botón +.';

  const encabezadoLista = (
    <>
      {/* Buscador */}
      <View style={styles.buscador}>
        <Ionicons name="search" size={20} color={Colors.textSoft} />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar taladro, bicicleta, martillo…"
          placeholderTextColor={Colors.placeholder}
          value={busqueda}
          onChangeText={setBusqueda}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Categorías */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIAS_FILTRO}
        keyExtractor={(item) => item}
        style={styles.chipsLista}
        contentContainerStyle={styles.chipsContenido}
        renderItem={({ item }) => {
          const activa = categoriaSeleccionada === item;
          return (
            <TouchableOpacity
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => setCategoriaSeleccionada(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                {activa && !cargando ? `${item} (${objetos.length})` : item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.seccion}>
        <Ionicons
          name={modo === 'intercambio' ? 'swap-horizontal-outline' : 'shapes-outline'}
          size={24}
          color={Colors.text}
        />
        <Text style={styles.seccionTitulo}>{titulo}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <MarcaHeader />

      <View style={styles.contenido}>
        <FlatList
          data={cargando ? [] : objetos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaObjeto objeto={item} altoImagen={altoImagen} />}
          ListHeaderComponent={encabezadoLista}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            cargando ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
            ) : (
              <View style={styles.vacio}>
                <Ionicons name="cube-outline" size={44} color={Colors.muted} />
                <Text style={styles.vacioTexto}>{textoVacio}</Text>
              </View>
            )
          }
        />
      </View>

      <BarraInferior activa={modo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Columna centrada con ancho máximo: en móvil ocupa todo el ancho
  contenido: { flex: 1, width: '100%', maxWidth: ANCHO_MAXIMO, alignSelf: 'center' },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  // Los chips se salen del padding de la lista para llegar al borde
  chipsLista: { marginHorizontal: -16, marginTop: 14 },
  chipsContenido: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTexto: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textSoft },
  chipTextoActivo: { fontFamily: Fonts.bold, color: '#FFF' },
  seccion: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 14 },
  seccionTitulo: { fontFamily: Fonts.extrabold, fontSize: 22, color: Colors.text },
  spinner: { marginTop: 48 },
  vacio: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  vacioTexto: {
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: Colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
});
