import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CatalogoHeader } from '@/components/CatalogoHeader';
import { objetosService } from '../../services/objetosService';
import { TipoPublicacion } from '../../types/objeto';
import { CATEGORIAS } from '../../constants/categorias';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

// En pantallas grandes (tablet/web) el formulario se centra en una columna tipo móvil
const ANCHO_MAXIMO = 600;

export default function PublicarObjeto() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Herramientas');
  const [tipo, setTipo] = useState<TipoPublicacion>('prestamo');
  const [condiciones, setCondiciones] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [diasTexto, setDiasTexto] = useState('');
  const [guardando, setGuardando] = useState(false);

  const elegirDeGaleria = async () => {
    // El selector de fotos del sistema no pide permiso (Android 13+ / iOS 14+)
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      // El base64 es la vía de subida en Android: se decodifica a bytes
      // (Uint8Array) y se sube directo — ver objetosService.subirFoto
      base64: true,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0]);
    }
  };

  const tomarFoto = async () => {
    // La cámara siempre requiere permiso explícito del usuario
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Sin permiso', 'Necesitamos acceso a la cámara para tomar la foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      // El base64 es la vía de subida en Android: se decodifica a bytes
      // (Uint8Array) y se sube directo — ver objetosService.subirFoto
      base64: true,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0]);
    }
  };

  const guardar = async () => {
    if (!titulo || !descripcion || !foto) {
      Alert.alert('Campos requeridos', 'Por favor completa el título, descripción y foto.');
      return;
    }

    // "Días máximos de préstamo": entero opcional (vacío → null)
    const dias = parseInt(diasTexto, 10);
    const diasMaxPrestamo = Number.isNaN(dias) ? null : dias;

    try {
      setGuardando(true);
      // 1) Subir la foto al Storage de Supabase → URL pública
      const urlFoto = await objetosService.subirFoto(foto);
      // 2) Crear el objeto con esa URL
      await objetosService.crearObjeto({
        titulo,
        descripcion,
        categoria,
        tipo,
        condiciones,
        imagenUrl: urlFoto,
        estado: 'disponible',
        diasMaxPrestamo,
        usuarioId: '',      // el servicio usa el id del usuario logueado
        usuarioNombre: '',  // el servicio usa nombre/email del usuario logueado
      });

      Alert.alert('Objeto publicado', 'Ya aparece en el catálogo para tus vecinos.');
      // Vuelve al catálogo pidiendo que la lista se refresque (param "actualizar")
      router.navigate({ pathname: '/catalogo', params: { actualizar: String(Date.now()) } });
    } catch (error) {
      // Mostramos el mensaje real de Supabase/Postgres (antes era genérico)
      const mensaje = (error as any)?.message;
      Alert.alert('Error al publicar', mensaje || 'No se pudo publicar el objeto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header propio: empuja el contenido, no se superpone */}
      <CatalogoHeader title="Publicar objeto" mostrarAtras />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tarjeta}>
          <Text style={[styles.label, styles.labelPrimero]}>Título del objeto</Text>
          <TextInput 
            style={styles.input}
            value={titulo} 
            onChangeText={setTitulo} 
            placeholder="Ej. Taladro Inalámbrico" 
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          <Text style={styles.label}>Categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriasRow}
          >
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, categoria === cat && styles.chipActivo]}
                onPress={() => setCategoria(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipTexto, categoria === cat && styles.chipTextoActivo]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Modalidad</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.typeBtn, tipo === 'prestamo' && styles.typeBtnActive]} 
              onPress={() => setTipo('prestamo')}
              activeOpacity={0.8}
            >
              <Text style={tipo === 'prestamo' ? styles.typeTextActive : styles.typeText}>Préstamo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, tipo === 'intercambio' && styles.typeBtnActive]} 
              onPress={() => setTipo('intercambio')}
              activeOpacity={0.8}
            >
              <Text style={tipo === 'intercambio' ? styles.typeTextActive : styles.typeText}>Intercambio</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Días máximos de préstamo (opcional)</Text>
          <TextInput 
            style={styles.input}
            value={diasTexto} 
            onChangeText={setDiasTexto} 
            placeholder="Ej. 7" 
            placeholderTextColor={Colors.placeholder}
            keyboardType="number-pad"
            maxLength={3}
            returnKeyType="done"
          />

          <Text style={styles.label}>Foto del objeto</Text>
          <View style={styles.fotoBox}>
            {foto ? (
              <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
            ) : (
              <View style={styles.fotoVacia}>
                <Ionicons name="image-outline" size={42} color={Colors.muted} />
                <Text style={styles.fotoVaciaTexto}>
                  Toma una foto o elige una de tu galería
                </Text>
              </View>
            )}
          </View>
          <View style={styles.fotoBotones}>
            <TouchableOpacity style={styles.fotoBtn} onPress={tomarFoto} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
              <Text style={styles.fotoBtnTexto}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fotoBtn} onPress={elegirDeGaleria} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
              <Text style={styles.fotoBtnTexto}>Galería</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={descripcion} 
            onChangeText={setDescripcion} 
            placeholder="Describe tu objeto: estado, accesorios, etc." 
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Condiciones (opcional)</Text>
          <TextInput 
            style={styles.input}
            value={condiciones} 
            onChangeText={setCondiciones} 
            placeholder="Ej. Devuelvo en máximo 3 días" 
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="sentences"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, guardando && styles.submitBtnDisabled]} 
            onPress={guardar} 
            disabled={guardando}
            activeOpacity={0.8}
          >
            {guardando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Publicar objeto</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  // Columna centrada con ancho máximo: en móvil ocupa todo el ancho
  contenido: {
    width: '100%',
    maxWidth: ANCHO_MAXIMO,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tarjeta: { backgroundColor: Colors.card, borderRadius: 16, padding: 16 },
  label: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 8 },
  labelPrimero: { marginTop: 0 },
  // Altura táctil mínima de 50px: cómodo para el dedo y tipografía legible
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 50,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { minHeight: 120 },
  row: { flexDirection: 'row', gap: 12 },
  categoriasRow: { gap: 8, paddingBottom: 4 },
  fotoBox: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  fotoPreview: { width: '100%', height: 220 },
  fotoVacia: { height: 200, justifyContent: 'center', alignItems: 'center', gap: 10 },
  fotoVaciaTexto: {
    fontFamily: Fonts.regular,
    color: Colors.textSoft,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  fotoBotones: { flexDirection: 'row', gap: 12, marginTop: 12 },
  fotoBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  fotoBtnTexto: { fontFamily: Fonts.bold, color: Colors.primary, fontSize: 15 },
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
  chipTexto: { fontFamily: Fonts.medium, color: Colors.textSoft, fontSize: 13 },
  chipTextoActivo: { fontFamily: Fonts.bold, color: '#FFF' },
  typeBtn: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
  },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeText: { fontFamily: Fonts.bold, color: Colors.textSoft, fontSize: 15 },
  typeTextActive: { fontFamily: Fonts.bold, color: '#FFF', fontSize: 15 },
  submitBtn: {
    backgroundColor: Colors.primary,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 28,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { fontFamily: Fonts.bold, color: '#FFF', fontSize: 16 },
});
