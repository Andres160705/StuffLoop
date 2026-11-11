import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface ObjetoImagenProps {
  /** URL de la foto; puede venir vacía si el objeto no tiene */
  uri?: string | null;
  /** Estilo de la imagen (incluye el alto, lo hereda el respaldo) */
  style: StyleProp<ImageStyle>;
}

/**
 * Imagen de objeto con respaldo propio: si no hay foto o la URL falla al
 * cargar, muestra una caja gris con un icono en vez de la imagen rota
 * (antes usábamos via.placeholder.com, un servicio que ya no existe).
 */
export function ObjetoImagen({ uri, style }: ObjetoImagenProps) {
  const [fallo, setFallo] = useState(false);
  const mostrarImagen = !!uri && !fallo;

  if (!mostrarImagen) {
    return (
      <View style={[style, styles.respaldo]}>
        <Ionicons name="image-outline" size={36} color={Colors.muted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: uri as string }}
      style={style}
      onError={() => setFallo(true)}
    />
  );
}

const styles = StyleSheet.create({
  respaldo: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
  },
});
