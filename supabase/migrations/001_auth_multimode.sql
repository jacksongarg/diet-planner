-- Diet Planner Authentication & Multi-Mode System
-- Migration: 001_auth_multimode.sql
-- Created: 2026-03-30

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'dietician')),
  avatar_url TEXT,

  -- Physical stats for calorie calculations
  height_cm NUMERIC,
  weight_kg NUMERIC,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),

  -- Diet settings
  activity_level TEXT DEFAULT 'moderately_active' CHECK (
    activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')
  ),
  goal TEXT DEFAULT 'maintain_weight' CHECK (
    goal IN ('lose_weight', 'maintain_weight', 'gain_muscle', 'improve_health')
  ),

  -- Calculated macro targets
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,

  -- App settings
  view_mode TEXT DEFAULT 'single' CHECK (view_mode IN ('single', 'couple', 'dietician')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONNECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('couple', 'friend', 'dietician_client')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id, type)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEAL PLANS TABLE (per user)
-- ============================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Meal Plan',
  description TEXT,
  daily_calories INTEGER,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fat_grams INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ============================================
-- MEALS TABLE (7 days x 5 meals per day)
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (
    day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  meal_type TEXT NOT NULL CHECK (
    meal_type IN ('breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner')
  ),
  text TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  notes TEXT,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(plan_id, day_of_week, meal_type)
);

-- ============================================
-- MEAL COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, meal_id, date)
);

-- ============================================
-- SUPPLEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  timing TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLEMENT ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS supplement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMPTZ,
  UNIQUE(supplement_id, user_id, date)
);

-- ============================================
-- WEIGHT ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- SHARED PREP NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shared_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (
    day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, day_of_week)
);

-- ============================================
-- DAILY STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  calories_consumed INTEGER DEFAULT 0,
  protein_consumed INTEGER DEFAULT 0,
  carbs_consumed INTEGER DEFAULT 0,
  fat_consumed INTEGER DEFAULT 0,
  calories_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  meals_completed INTEGER DEFAULT 0,
  meals_total INTEGER DEFAULT 5,
  supplements_taken INTEGER DEFAULT 0,
  supplements_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan ON meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_date ON meal_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Connected users can read profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND recipient_id = profiles.id)
        OR (recipient_id = auth.uid() AND requester_id = profiles.id))
    )
  );

-- Connections policies
CREATE POLICY "Users can read own connections" ON connections
  FOR SELECT USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Meal plans policies
CREATE POLICY "Users can manage own meal plans" ON meal_plans
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Connected users can read meal plans" ON meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND recipient_id = meal_plans.user_id)
        OR (recipient_id = auth.uid() AND requester_id = meal_plans.user_id))
    )
  );

CREATE POLICY "Dieticians can manage client meal plans" ON meal_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND type = 'dietician_client'
      AND requester_id = auth.uid()
      AND recipient_id = meal_plans.user_id
    )
  );

-- Meals policies
CREATE POLICY "Users can manage own meals" ON meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meals.plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Connected users can read meals" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN connections c ON c.status = 'accepted'
      WHERE mp.id = meals.plan_id
      AND ((c.requester_id = auth.uid() AND c.recipient_id = mp.user_id)
        OR (c.recipient_id = auth.uid() AND c.requester_id = mp.user_id))
    )
  );

-- Meal completions policies
CREATE POLICY "Users can manage own completions" ON meal_completions
  FOR ALL USING (user_id = auth.uid());

-- Supplements policies
CREATE POLICY "Users can manage own supplements" ON supplements
  FOR ALL USING (user_id = auth.uid());

-- Supplement entries policies
CREATE POLICY "Users can manage own supplement entries" ON supplement_entries
  FOR ALL USING (user_id = auth.uid());

-- Weight entries policies
CREATE POLICY "Users can manage own weight entries" ON weight_entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Connected users can read weight entries" ON weight_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND recipient_id = weight_entries.user_id)
        OR (recipient_id = auth.uid() AND requester_id = weight_entries.user_id))
    )
  );

-- Shared prep policies
CREATE POLICY "Users can manage shared prep" ON shared_prep
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = shared_prep.plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Connected users can read shared prep" ON shared_prep
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN connections c ON c.status = 'accepted'
      WHERE mp.id = shared_prep.plan_id
      AND ((c.requester_id = auth.uid() AND c.recipient_id = mp.user_id)
        OR (c.recipient_id = auth.uid() AND c.requester_id = mp.user_id))
    )
  );

-- Daily stats policies
CREATE POLICY "Users can manage own daily stats" ON daily_stats
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Connected users can read daily stats" ON daily_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND recipient_id = daily_stats.user_id)
        OR (recipient_id = auth.uid() AND requester_id = daily_stats.user_id))
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER meals_updated_at BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shared_prep_updated_at BEFORE UPDATE ON shared_prep
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Notify on connection request
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  SELECT name INTO requester_name FROM profiles WHERE id = NEW.requester_id;

  CASE NEW.type
    WHEN 'couple' THEN
      notif_title := 'Partner Request';
      notif_message := requester_name || ' wants to be your diet partner';
    WHEN 'friend' THEN
      notif_title := 'Friend Request';
      notif_message := requester_name || ' wants to track meals with you';
    WHEN 'dietician_client' THEN
      notif_title := 'Dietician Request';
      notif_message := requester_name || ' (Dietician) wants to manage your meals';
    ELSE
      notif_title := 'Connection Request';
      notif_message := requester_name || ' wants to connect';
  END CASE;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.recipient_id,
    'connection_request',
    notif_title,
    notif_message,
    jsonb_build_object(
      'connection_id', NEW.id,
      'requester_id', NEW.requester_id,
      'requester_name', requester_name,
      'connection_type', NEW.type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_request
  AFTER INSERT ON connections
  FOR EACH ROW EXECUTE FUNCTION notify_connection_request();

-- Notify when connection accepted
CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  accepter_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT name INTO accepter_name FROM profiles WHERE id = NEW.recipient_id;

    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.requester_id,
      'connection_accepted',
      'Connection Accepted',
      accepter_name || ' accepted your request',
      jsonb_build_object(
        'connection_id', NEW.id,
        'accepter_id', NEW.recipient_id,
        'accepter_name', accepter_name,
        'connection_type', NEW.type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION notify_connection_accepted();
