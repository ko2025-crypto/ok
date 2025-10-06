/*
  # Sistema de Gestión de Contenido en Tiempo Real

  1. Nuevas Tablas
    - `novelas`
      - `id` (uuid, primary key)
      - `title` (text) - Título de la novela
      - `description` (text) - Descripción
      - `image_url` (text) - URL de la imagen
      - `status` (text) - Estado: 'streaming' o 'finished'
      - `episodes` (integer) - Número de episodios
      - `genre` (text) - Género
      - `year` (integer) - Año de lanzamiento
      - `created_at` (timestamptz) - Fecha de creación
      - `updated_at` (timestamptz) - Fecha de actualización
      
    - `movies`
      - `id` (uuid, primary key)
      - `tmdb_id` (integer, unique) - ID de TMDB
      - `title` (text) - Título
      - `description` (text) - Descripción
      - `poster_url` (text) - URL del póster
      - `backdrop_url` (text) - URL del backdrop
      - `genre` (text) - Género
      - `year` (integer) - Año
      - `rating` (numeric) - Calificación
      - `is_visible` (boolean) - Visibilidad
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tv_shows`
      - Similar estructura a movies
    
    - `anime`
      - Similar estructura a movies
    
    - `carousel_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `content_type` (text) - Tipo: 'movie', 'tv', 'anime', 'novela'
      - `content_id` (text) - ID del contenido relacionado
      - `order_index` (integer) - Orden de visualización
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `app_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Clave de configuración
      - `value` (jsonb) - Valor de configuración
      - `updated_at` (timestamptz)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para lectura pública
    - Políticas para escritura solo autenticados (admin)

  3. Notas Importantes
    - Todas las tablas incluyen timestamps para auditoría
    - Se usan UUID para IDs únicos
    - JSONB para configuraciones flexibles
    - Índices para optimizar consultas frecuentes
*/

-- Crear tabla de novelas
CREATE TABLE IF NOT EXISTS novelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  status text DEFAULT 'streaming' CHECK (status IN ('streaming', 'finished')),
  episodes integer DEFAULT 0,
  genre text DEFAULT '',
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de películas
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  poster_url text DEFAULT '',
  backdrop_url text DEFAULT '',
  genre text DEFAULT '',
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  rating numeric(3,1) DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de series de TV
CREATE TABLE IF NOT EXISTS tv_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  poster_url text DEFAULT '',
  backdrop_url text DEFAULT '',
  genre text DEFAULT '',
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  rating numeric(3,1) DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de anime
CREATE TABLE IF NOT EXISTS anime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  poster_url text DEFAULT '',
  backdrop_url text DEFAULT '',
  genre text DEFAULT '',
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  rating numeric(3,1) DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de items del carrusel
CREATE TABLE IF NOT EXISTS carousel_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text DEFAULT '',
  content_type text NOT NULL CHECK (content_type IN ('movie', 'tv', 'anime', 'novela')),
  content_id text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de configuración de la aplicación
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_novelas_status ON novelas(status);
CREATE INDEX IF NOT EXISTS idx_novelas_created_at ON novelas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_visible ON movies(is_visible);
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON tv_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_visible ON tv_shows(is_visible);
CREATE INDEX IF NOT EXISTS idx_anime_tmdb_id ON anime(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_anime_visible ON anime(is_visible);
CREATE INDEX IF NOT EXISTS idx_carousel_order ON carousel_items(order_index);
CREATE INDEX IF NOT EXISTS idx_carousel_active ON carousel_items(is_active);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Habilitar Row Level Security
ALTER TABLE novelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública
CREATE POLICY "Todos pueden ver novelas"
  ON novelas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Todos pueden ver películas visibles"
  ON movies FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Todos pueden ver series visibles"
  ON tv_shows FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Todos pueden ver anime visible"
  ON anime FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Todos pueden ver items activos del carrusel"
  ON carousel_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Todos pueden ver configuración"
  ON app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Políticas para escritura (admin)
CREATE POLICY "Usuarios autenticados pueden insertar novelas"
  ON novelas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar novelas"
  ON novelas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar novelas"
  ON novelas FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar películas"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar películas"
  ON movies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar películas"
  ON movies FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar series"
  ON tv_shows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar series"
  ON tv_shows FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar series"
  ON tv_shows FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar anime"
  ON anime FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar anime"
  ON anime FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar anime"
  ON anime FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar items del carrusel"
  ON carousel_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar items del carrusel"
  ON carousel_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar items del carrusel"
  ON carousel_items FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar configuración"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar configuración"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_novelas_updated_at
  BEFORE UPDATE ON novelas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tv_shows_updated_at
  BEFORE UPDATE ON tv_shows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anime_updated_at
  BEFORE UPDATE ON anime
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carousel_items_updated_at
  BEFORE UPDATE ON carousel_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();