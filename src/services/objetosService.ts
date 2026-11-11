import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { Objeto, TipoPublicacion } from '../types/objeto';
import { CATEGORIA_APP_A_DB, CATEGORIA_DB_A_APP } from '../constants/categorias';

// Mapa de modalidades: la app habla "prestamo/intercambio", pero el enum
// `modalidad_objeto` de la tabla solo acepta "prestamo" y "trueque"
const MODALIDAD_APP_A_DB: Record<string, string> = {
  prestamo: 'prestamo',
  intercambio: 'trueque',
};
const MODALIDAD_DB_A_APP: Record<string, string> = {
  prestamo: 'prestamo',
  trueque: 'intercambio',
};

// Traduce una fila de la tabla (columnas reales + enums) a la forma camelCase
// que usa el resto de la app
function normalizarObjeto(item: any): Objeto {
  return {
    ...item,
    // Sin placeholder externo: via.placeholder.com está muerto; si no hay
    // foto, la UI muestra un respaldo propio (components/ObjetoImagen)
    imagenUrl: item.foto_url || item.imagenUrl || '',
    usuarioNombre: item.nombre || item.usuarioNombre || 'Vecino',
    usuarioId: item.id_usuario_propietario || item.usuario_id || item.usuarioId || '',
    condiciones: item.condicion || item.condiciones || '',
    diasMaxPrestamo: item.dias_max_prestamo ?? null,
    creadoEn: item.fecha_publicacion || item.creadoEn,
    tipo: (MODALIDAD_DB_A_APP[item.modalidad] || item.tipo || 'prestamo') as TipoPublicacion,
    estado: item.estado_objeto || item.estado || 'disponible',
    categoria: CATEGORIA_DB_A_APP[item.categoria] || item.categoria || 'Otros',
  } as Objeto;
}

// Foto local lista para subir (viene de expo-image-picker)
export interface FotoParaSubir {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

export const objetosService = {
  /**
   * Sube una foto (cámara o galería) al bucket "objetos-fotos" de Supabase
   * Storage y devuelve su URL pública, lista para guardar en foto_url.
   */
  async subirFoto(foto: FotoParaSubir): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    const mime = foto.mimeType || 'image/jpeg';
    const extension = mime.split('/')[1] || 'jpg';
    const nombreArchivo = `${Date.now()}.${extension}`;
    const ruta = `${user?.id || 'sin-sesion'}/${nombreArchivo}`;

    // Cuerpo que se le pasa a storage.upload(). En Android NO se puede leer
    // la foto con fetch(file://...): está roto desde RN 0.82 (issue #54626) y
    // devuelve basura ("File not found") o falla — y esa basura se subía al
    // bucket como si fuera la foto. En Android usamos el descriptor nativo
    // {uri, name, type}: RN pasa el archivo directo al streaming de OkHttp sin
    // leerlo en JS (convertRequestBody → RequestBodyUtil.getFileInputStream,
    // que sí soporta file:// y content://). En iOS/web el fetch → Blob sí
    // funciona (verificado con iPhone real).
    let cuerpo: any;
    if (Platform.OS === 'android') {
      cuerpo = { uri: foto.uri, name: nombreArchivo, type: mime };
    } else {
      const respuesta = await fetch(foto.uri);
      // Blindaje: si el fetch falla, que reviente aquí y NO suba basura
      if (!respuesta.ok) {
        throw new Error(`No se pudo leer la foto del dispositivo (código ${respuesta.status}).`);
      }
      const blob = await respuesta.blob();
      if (!blob || blob.size === 0) {
        throw new Error('La foto seleccionada está vacía o ilegible.');
      }
      cuerpo = blob;
    }

    const { error } = await supabase.storage
      .from('objetos-fotos')
      .upload(ruta, cuerpo, { contentType: mime });

    if (error) {
      console.error('Error al subir la foto:', error);
      throw error;
    }

    const { data } = supabase.storage.from('objetos-fotos').getPublicUrl(ruta);
    return data.publicUrl;
  },

  async obtenerObjetos(categoria?: string, busqueda?: string): Promise<Objeto[]> {
    let query = supabase.from('objetos').select('*');

    if (categoria && categoria !== 'Todos') {
      const categoriaDb = CATEGORIA_APP_A_DB[categoria] ?? categoria.toLowerCase();
      query = query.eq('categoria', categoriaDb);
    }

    if (busqueda && busqueda.trim() !== '') {
      query = query.ilike('titulo', `%${busqueda.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener objetos:', error);
      throw error;
    }

    return (data || []).map(normalizarObjeto);
  },

  async obtenerPorId(id: string): Promise<Objeto | null> {
    const { data, error } = await supabase
      .from('objetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error al obtener objeto ${id}:`, error);
      throw error;
    }

    if (!data) return null;
    return normalizarObjeto(data);
  },

  async crearObjeto(nuevoObjeto: Omit<Objeto, 'id' | 'creadoEn' | 'created_at'>): Promise<Objeto> {
    const { data: { user } } = await supabase.auth.getUser();

    const usuarioIdFinal = user?.id || nuevoObjeto.usuarioId || '';
    // El registro con email guarda "nombre" y Google suele guardar "full_name"
    const usuarioNombreFinal =
      user?.user_metadata?.nombre ||
      user?.user_metadata?.full_name ||
      user?.email ||
      nuevoObjeto.usuarioNombre ||
      'Vecino';

    // Columnas REALES de la tabla objetos (orden del Table Editor):
    // id_objeto (uuid, se omite: Postgres lo genera), id_usuario_propietario
    // (uuid NOT NULL: quién publicó), nombre, categoria (enum), descripcion,
    // condicion, dias_max_prestamo (int), modalidad (enum), estado_objeto
    // (enum), foto_url, fecha_publicacion (timestamptz), id (uuid, default),
    // titulo, propietario_id (uuid), disponible (bool)
    const payload = {
      id_usuario_propietario: usuarioIdFinal || null, // NOT NULL: dueño del objeto
      titulo: nuevoObjeto.titulo,
      descripcion: nuevoObjeto.descripcion,
      categoria: CATEGORIA_APP_A_DB[nuevoObjeto.categoria] ?? nuevoObjeto.categoria.toLowerCase(),
      modalidad: MODALIDAD_APP_A_DB[nuevoObjeto.tipo] || 'prestamo',
      estado_objeto: 'disponible',
      disponible: true,
      condicion: nuevoObjeto.condiciones || '',
      dias_max_prestamo: nuevoObjeto.diasMaxPrestamo ?? null,
      foto_url: nuevoObjeto.imagenUrl,
      fecha_publicacion: new Date().toISOString(),
      propietario_id: usuarioIdFinal || null, // columna espejo que trae la tabla
      nombre: usuarioNombreFinal,
    };

    const { data, error } = await supabase
      .from('objetos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error al crear objeto:', error);
      throw error;
    }

    return normalizarObjeto(data);
  }
};

export default objetosService;
