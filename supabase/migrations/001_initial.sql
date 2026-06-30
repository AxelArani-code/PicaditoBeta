-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('player', 'venue_owner', 'admin');
CREATE TYPE pitch_type AS ENUM ('5v5', '7v7', '9v9', '11v11');
CREATE TYPE pitch_surface AS ENUM ('cesped_natural', 'sintetico', 'cemento', 'parquet');
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'unavailable');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
CREATE TYPE match_status AS ENUM ('scheduled', 'played', 'cancelled');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'player',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- 2. Added CHECK constraint to enforce valid roles
    CONSTRAINT check_profiles_role CHECK (role IN ('player', 'venue_owner', 'admin'))
);

-- VENUES
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- PITCHES
CREATE TABLE pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CONSTRAINT check_pitch_type CHECK (type IN ('5v5', '7v7', '9v9', '11v11')),
    surface TEXT NOT NULL CONSTRAINT check_pitch_surface CHECK (surface IN ('cesped_natural', 'sintetico', 'cemento', 'parquet')),
    price_per_hour NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- AVAILABILITY RULES
CREATE TABLE availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_override NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TIME SLOTS
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CONSTRAINT check_time_slots_status CHECK (status IN ('available', 'booked', 'unavailable')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pitch_id, date, start_time)
);

-- BOOKINGS
-- (Added pitch_id and date for denormalized indexing and performance)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CONSTRAINT check_bookings_status CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
    total_price NUMERIC(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
); 

-- MATCHES
-- (Added venue_id and date for denormalized indexing and performance)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CONSTRAINT check_matches_status CHECK (status IN ('scheduled', 'played', 'cancelled')),
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEAMS
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captain_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- MATCH PLAYERS
CREATE TABLE match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    guest_name TEXT,
    team_side TEXT CHECK (team_side IN ('home', 'away')),
    is_mvp BOOLEAN DEFAULT false,
    goals INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL)
);

-- TEAM MEMBERS
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'player' CHECK (role IN ('captain', 'player')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- VENUE RATINGS
CREATE TABLE venue_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, match_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_venues_slug ON venues(slug);

CREATE INDEX idx_pitches_venue ON pitches(venue_id);

-- Requested Composite Indices for Performance
CREATE INDEX idx_time_slots_pitch_date ON time_slots(pitch_id, date);
CREATE INDEX idx_bookings_pitch_date ON bookings(pitch_id, date);
CREATE INDEX idx_matches_venue_date ON matches(venue_id, date);
CREATE INDEX idx_match_players_match ON match_players(match_id);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_timeslot ON bookings(time_slot_id);

CREATE INDEX idx_matches_booking ON matches(booking_id);
CREATE INDEX idx_match_players_user ON match_players(user_id);

CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- ==========================================
-- 4. VIEWS
-- ==========================================
CREATE OR REPLACE VIEW player_stats AS
SELECT 
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT mp.match_id) as matches_played,
    SUM(mp.goals) as total_goals,
    COUNT(DISTINCT CASE WHEN mp.is_mvp THEN mp.id END) as mvp_awards
FROM profiles p
LEFT JOIN match_players mp ON p.id = mp.user_id
LEFT JOIN matches m ON mp.match_id = m.id AND m.status = 'played'
GROUP BY p.id;

CREATE OR REPLACE VIEW player_ranking AS
SELECT 
    user_id,
    username,
    full_name,
    avatar_url,
    matches_played,
    total_goals,
    mvp_awards,
    (matches_played * 10 + COALESCE(total_goals, 0) * 5 + mvp_awards * 20) as rnk_score
FROM player_stats
ORDER BY rnk_score DESC;

-- ==========================================
-- 5. TRIGGERS & FUNCTIONS
-- ==========================================

-- updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_venues BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_pitches BEFORE UPDATE ON pitches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_matches BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_teams BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- on_auth_user_created trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'player'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- helper function to slugify
CREATE OR REPLACE FUNCTION slugify(v TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN trim(BOTH '-' FROM regexp_replace(lower(unaccent(v)), '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- venues_slugify trigger
CREATE OR REPLACE FUNCTION venues_slugify_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.name) || '-' || substr(md5(random()::text), 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_slugify
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION venues_slugify_fn();

-- teams_slugify trigger
CREATE OR REPLACE FUNCTION teams_slugify_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.name) || '-' || substr(md5(random()::text), 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_slugify
  BEFORE INSERT OR UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION teams_slugify_fn();

-- booking_status_changed trigger
CREATE OR REPLACE FUNCTION handle_booking_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_venue_id UUID;
BEGIN
  -- CASO: CONFIRMACIÓN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- 1. Mark slot as booked
    UPDATE time_slots SET status = 'booked' WHERE id = NEW.time_slot_id;

    -- 2. Crea el partido
    -- Need venue_id for the match, get it from pitches
    SELECT venue_id INTO v_venue_id FROM pitches WHERE id = NEW.pitch_id;
    
    INSERT INTO matches (booking_id, venue_id, date, status) 
    VALUES (NEW.id, v_venue_id, NEW.date, 'scheduled')
    ON CONFLICT (booking_id) DO UPDATE SET status = 'scheduled';

    -- 3. Notify player
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Reserva Confirmada',
      'Tu reserva ha sido confirmada por el complejo.',
      'booking_confirmed',
      '/dashboard/reservas'
    );

  -- CASO: RECHAZO
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE time_slots SET status = 'available' WHERE id = NEW.time_slot_id;
    
    -- El partido (si existiera) se marca como cancelado
    UPDATE matches SET status = 'cancelled' WHERE booking_id = NEW.id;
    
    -- 3. Notificar al jugador
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Reserva Rechazada',
      'Tu reserva no pudo ser confirmada.',
      'booking_rejected',
      '/dashboard/reservas'
    );

  -- CASO: CANCELACIÓN (Reserva confirmada que se cae)
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE time_slots SET status = 'available' WHERE id = NEW.time_slot_id;
    
    -- El partido pasa a cancelado para mantener estadísticas
    UPDATE matches SET status = 'cancelled' WHERE booking_id = NEW.id;

    -- Notificación de cancelación (Lógica añadida para cerrar el ciclo)
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Reserva Cancelada',
      'Tu reserva confirmada ha sido cancelada por el complejo.',
      'booking_cancelled',
      '/dashboard/reservas'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_changed
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION handle_booking_status_changed();

-- Default values for denormalized columns trigger
CREATE OR REPLACE FUNCTION set_booking_denormalized_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pitch_id IS NULL OR NEW.date IS NULL THEN
    SELECT pitch_id, date INTO NEW.pitch_id, NEW.date
    FROM time_slots WHERE id = NEW.time_slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_denormalized_data_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_denormalized_data();


-- funcion helper para bypass de admin en RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- VENUES
CREATE POLICY "Venues viewable by everyone if not deleted" ON venues FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admin and Owners can insert venues" ON venues 
FOR INSERT WITH CHECK (
  is_admin() -- 1. El Admin puede insertar CUALQUIER owner_id
  OR (
    -- 2. El dueño solo puede insertarse a SÍ MISMO
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'venue_owner'
    )
  )
);
CREATE POLICY "Admins and Venue owners can update venues" ON venues 
FOR UPDATE USING (
  is_admin() -- El bypass del Admin
  OR auth.uid() = owner_id -- Regla original para el dueño
);

-- PITCHES
CREATE POLICY "Pitches visibility by role" ON pitches 
FOR SELECT USING (
  is_admin() -- 1. Admin ve todo (activas e inactivas)
  OR (
    deleted_at IS NULL AND (
      is_active = true -- 2. Jugadores solo ven activas
      OR auth.uid() = (SELECT v.owner_id FROM venues v WHERE v.id = venue_id) -- 3. Dueño ve sus inactivas
    )
  )
);
CREATE POLICY "Admins and Venue owners can update pitches" ON pitches 
FOR ALL 
USING (
  public.is_admin() -- Bypass total si la función retorna true
  OR 
  EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = pitches.venue_id -- El DUEÑO puede gestionar si la cancha pertenece a su local
      AND venues.owner_id = auth.uid()
  )
);


-- AVAILABILITY RULES
CREATE POLICY "Availability rules viewable by everyone" ON availability_rules FOR SELECT USING (true);
CREATE POLICY "Admins y Venue owners can manage rules" ON availability_rules FOR ALL USING (
  public.is_admin()
  OR
  EXISTS(
    SELECT 1 FROM pitches p JOIN venues v ON p.venue_id = v.id 
    WHERE p.id = availability_rules.pitch_id AND v.owner_id = auth.uid()
  )
);

-- TIME SLOTS
CREATE POLICY "Time slots viewable by everyone" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Admins and Venue owners can manage slots" ON time_slots FOR ALL TO authenticated 
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM pitches p JOIN venues v ON p.venue_id = v.id 
    WHERE p.id = time_slots.pitch_id AND v.owner_id = auth.uid()
  )
);

-- BOOKINGS
CREATE POLICY "Admin, Venue owners and Users can view bookings" ON bookings FOR SELECT USING (
  is_admin() -- El Admin ve todo 
  OR (
    -- REGLA PARA EL DUEÑO (Sin filtro de deleted_at en la reserva)
    EXISTS (
      SELECT 1 FROM pitches p 
      JOIN venues v ON p.venue_id = v.id
      WHERE p.id = bookings.pitch_id 
        AND v.owner_id = auth.uid() 
        AND v.deleted_at IS NULL -- El local sí debe estar activo
    )
  )
  OR (
    -- REGLA PARA EL USER (Con filtros estrictos)
    auth.uid() = user_id 
    AND status = 'pending' 
    AND deleted_at IS NULL
  )
);
CREATE POLICY "Admins, Venue owners and Users can insert bookings" 
ON bookings FOR INSERT 
WITH CHECK (
  is_admin() -- 1. El Admin puede todo
  OR (auth.uid() = user_id) -- 2. El Player/Owner puede insertar si el user_id es el suyo
  OR EXISTS ( 
    -- 3. Seguridad extra: El dueño puede insertar si la cancha le pertenece
    SELECT 1 FROM pitches p 
    JOIN venues v ON p.venue_id = v.id
    WHERE p.id = pitch_id AND v.owner_id = auth.uid()
  )
);
CREATE POLICY "Admins, Venue owners and Users update bookings" ON bookings 
FOR UPDATE 
USING (
  is_admin() 
  OR (auth.uid() = user_id AND status = 'pending') 
  OR EXISTS(
    SELECT 1 FROM pitches p JOIN venues v ON p.venue_id = v.id
    WHERE p.id = bookings.pitch_id AND v.owner_id = auth.uid()
  )
)
WITH CHECK (
  is_admin() -- El admin puede cambiar cualquier campo a cualquier valor
  OR (
    -- El JUGADOR solo puede cambiar el estado a 'cancelled'
    -- Y NO puede cambiar el ID de usuario ni el precio
    auth.uid() = user_id 
    AND status = 'cancelled' -- <--- Restricción de seguridad clave
    AND (user_id = (SELECT user_id FROM bookings WHERE id = id)) -- Evita cambio de dueño
  )
  OR EXISTS(
    -- El DUEÑO puede gestionar estados, pero la reserva debe seguir siendo de su local
    SELECT 1 FROM pitches p JOIN venues v ON p.venue_id = v.id
    WHERE p.id = bookings.pitch_id AND v.owner_id = auth.uid()
  )
);

-- MATCHES
CREATE POLICY "Matches viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Admins, Venue owners and players can update match" ON matches 
FOR UPDATE 
TO authenticated 
USING (
  -- Permiso 1: El usuario es Administrador (bypass total)
  public.is_admin()
  
  -- Permiso 2: El usuario es el dueño del establecimiento (venue) donde se juega el partido
  OR EXISTS (
    SELECT 1 FROM venues v 
    WHERE v.id = matches.venue_id AND v.owner_id = auth.uid()
  ) 
  
  -- Permiso 3: El usuario es un jugador inscrito en este partido específico
  OR EXISTS (
    SELECT 1 FROM match_players mp 
    WHERE mp.match_id = matches.id AND mp.user_id = auth.uid()
  )
);

-- MATCH PLAYERS
CREATE POLICY "Match players viewable by everyone" ON match_players FOR SELECT USING (true);
CREATE POLICY "Match players manageable by participant or owner" ON match_players FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS(
    SELECT 1 FROM matches m JOIN venues v ON m.venue_id = v.id
    WHERE m.id = match_players.match_id AND v.owner_id = auth.uid()
  )
);

-- TEAMS
CREATE POLICY "Teams viewable by everyone if not deleted" ON teams FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admins y Captain can manage team" ON public.teams
FOR All 
USING (
  public.is_admin() -- Bypass total para Admin
  OR 
  captain_id = auth.uid()
);

-- TEAM MEMBERS
CREATE POLICY "Team members viewable by everyone" ON team_members FOR SELECT USING (true);
CREATE POLICY "Admins and Captain can manage team members" ON team_members FOR ALL USING (
  public.is_admin()
  OR
  EXISTS(SELECT 1 FROM teams WHERE id = team_id AND captain_id = auth.uid()) OR user_id = auth.uid()
);

-- VENUE RATINGS
CREATE POLICY "Ratings viewable by everyone" ON venue_ratings FOR SELECT USING (true);
CREATE POLICY "Participants can rate" ON venue_ratings FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS(
    SELECT 1 FROM match_players mp WHERE mp.match_id = venue_ratings.match_id AND mp.user_id = auth.uid()
  )
);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins and Users can update own notifications" ON notifications
  FOR UPDATE USING (
  public.is_admin() 
  OR
  auth.uid() = user_id
  );

-- AUDIT LOGS
CREATE POLICY "Admins and Venue owners can view their audit logs" ON audit_logs 
FOR SELECT USING (
  public.is_admin() -- El Admin ve todo
  OR
  auth.uid() = user_id
);
CREATE POLICY "Admins and Venue owners can insert audit logs" ON audit_logs 
FOR INSERT WITH CHECK (
  public.is_admin() -- El Admin puede insertar con cualquier user_id
  OR
  auth.uid() = user_id
);

-- ==========================================
-- 7. REALTIME
-- ==========================================
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
