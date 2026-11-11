import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Objeto } from '@/types/objeto';
import { ObjetoImagen } from '@/components/ObjetoImagen';

interface TarjetaObjetoProps {
  objeto: Objeto;
  /** Alto de la foto (escala con el ancho de pantalla) */
  altoImagen: number;
}

/**
 * Tarjeta del catálogo: foto grande, título y una caja lavanda con el
 * dueño y la acción principal. Tocar la tarjeta o el botón abre el detalle,
 * que es donde se envía la solicitud.
 * (Calificación y "usuario verificado" llegarán en un próximo avance.)
 */
export function TarjetaObjeto({ objeto, altoImagen }: TarjetaObjetoProps) {
  const router = useRouter();
  const abrirDetalle = () => router.push(`/catalogo/${objeto.id}`);
  const esPrestamo = objeto.tipo !== 'intercambio';
  const inicial = (objeto.usuarioNombre || 'V').charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={abrirDetalle} activeOpacity={0.9}>
      <ObjetoImagen uri={objeto.imagenUrl} style={[styles.imagen, { height: altoImagen }]} />

      <Text style={styles.titulo} numberOfLines={2}>
        {objeto.titulo}
      </Text>

      <View style={styles.duenoCaja}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <View style={styles.duenoTextos}>
          <Text style={styles.duenoNombre} numberOfLines={1}>
            {objeto.usuarioNombre}
          </Text>
          <Text style={styles.duenoDetalle} numberOfLines={1}>
            {objeto.categoria}
          </Text>
        </View>
        <TouchableOpacity style={styles.boton} onPress={abrirDetalle} activeOpacity={0.85}>
          <Ionicons
            name={esPrestamo ? 'calendar-outline' : 'swap-horizontal-outline'}
            size={18}
            color="#FFF"
          />
          <Text style={styles.botonTexto}>
            {esPrestamo ? 'Solicitar préstamo' : 'Proponer intercambio'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  imagen: { width: '100%', borderRadius: 12, backgroundColor: Colors.background },
  titulo: {
    fontFamily: Fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.text,
    marginTop: 14,
    marginBottom: 10,
  },
  duenoCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: { fontFamily: Fonts.bold, fontSize: 18, color: '#FFF' },
  duenoTextos: { flex: 1 },
  duenoNombre: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text },
  duenoDetalle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSoft, marginTop: 1 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  botonTexto: { fontFamily: Fonts.bold, fontSize: 13, color: '#FFF' },
});
