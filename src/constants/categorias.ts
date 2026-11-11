// Categorías tal como las muestra la app (con mayúscula y acentos).
// El servicio las traduce a los valores del enum `categoria_objeto`
// de la tabla `objetos` en Supabase (minúsculas y sin acentos).
export const CATEGORIA_APP_A_DB: Record<string, string> = {
  Herramientas: 'herramientas',
  Hogar: 'hogar',
  Deportes: 'deportes',
  'Electrónica': 'electronica',
  Libros: 'libros',
  Otros: 'otros',
};

// Mapa inverso: valor del enum en la tabla → nombre bonito para la UI
export const CATEGORIA_DB_A_APP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIA_APP_A_DB).map(([app, db]) => [db, app])
);

// Categorías para el formulario de publicar
export const CATEGORIAS = Object.keys(CATEGORIA_APP_A_DB);

// Chips de filtro del catálogo ("Todos" no es una categoría real)
export const CATEGORIAS_FILTRO = ['Todos', ...CATEGORIAS];
