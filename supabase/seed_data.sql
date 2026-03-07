-- ================================================================================
-- SEED DATA - Picadito
-- ================================================================================

/* 
   ⚠️ IMPORTANTE: 
   Para los usuarios de Auth (auth.users), debes crearlos manualmente desde el 
   Dashboard de Supabase (Authentication -> Users) para que tengan una contraseña.
   
   Crea estos dos usuarios:
   1. Email: owner@picadito.com.ar  Password: password123
   2. Email: player@picadito.com.ar Password: password123
   
   Una vez creados, ejecuta este script. Este script actualizará sus perfiles
   con datos de prueba.
*/

-- 1. Actualizar roles de los perfiles creados automáticamente por el trigger
UPDATE profiles 
SET role = 'venue_owner', full_name = 'Dueño del Complejo', username = 'owner_demo'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'owner@picadito.com.ar');

UPDATE profiles 
SET role = 'player', full_name = 'Jugador Estrella', username = 'dieguito10'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'player@picadito.com.ar');

-- Obtener IDs (variables locales para el script)
DO $$
DECLARE
    owner_id UUID := (SELECT id FROM auth.users WHERE email = 'owner@picadito.com.ar');
    player_id UUID := (SELECT id FROM auth.users WHERE email = 'player@picadito.com.ar');
    venue_id UUID;
    pitch_id UUID;
    slot_id UUID;
BEGIN
    IF owner_id IS NULL OR player_id IS NULL THEN
        RAISE NOTICE 'Debes crear primero los usuarios owner@picadito.com.ar y player@picadito.com.ar en Auth';
        RETURN;
    END IF;

    -- 2. Crear un Complejo (Venue)
    INSERT INTO venues (owner_id, name, slug, description, address, city, phone, images)
    VALUES (
        owner_id, 
        'La Bombonerita Complejo', 
        'la-bombonerita', 
        'El mejor complejo de zona norte, con vestuarios y buffet.', 
        'Av. del Libertador 1234', 
        'Buenos Aires', 
        '1122334455',
        '{"https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"}'
    ) RETURNING id INTO venue_id;

    -- 3. Crear Canchas (Pitches)
    INSERT INTO pitches (venue_id, name, type, surface, price_per_hour)
    VALUES (venue_id, 'Cancha Principal - Centenario', '5v5', 'sintetico', 15000)
    RETURNING id INTO pitch_id;

    INSERT INTO pitches (venue_id, name, type, surface, price_per_hour)
    VALUES (venue_id, 'Cancha 2 - Maracaná', '7v7', 'cesped_natural', 25000);

    -- 4. Crear Slots de Disponibilidad para hoy y mañana
    FOR i IN 18..22 LOOP -- Slots de 18:00 a 22:00
        INSERT INTO time_slots (pitch_id, date, start_time, end_time, price, status)
        VALUES (pitch_id, current_date, (i || ':00:00')::time, ((i+1) || ':00:00')::time, 15000, 'available')
        RETURNING id INTO slot_id;
        
        -- Crear una reserva de prueba para el primer slot
        IF i = 18 THEN
            INSERT INTO bookings (time_slot_id, pitch_id, date, user_id, status, total_price)
            VALUES (slot_id, pitch_id, current_date, player_id, 'confirmed', 15000);
            
            -- Al confirmar via SQL, el trigger 'booking_status_changed' creará el Match automáticamente
        END IF;
    END LOOP;

    -- 5. Crear un Equipo
    INSERT INTO teams (captain_id, name, slug)
    VALUES (player_id, 'Los Galácticos FC', 'los-galacticos');

    -- Notificación de bienvenida
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (player_id, '¡Bienvenido!', 'Gracias por unirte a Picadito. ¡A jugar!', 'welcome');

END $$;
