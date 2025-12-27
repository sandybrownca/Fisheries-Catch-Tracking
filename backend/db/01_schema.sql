-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','regulator','captain','operator')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- SPECIES
CREATE TABLE species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  species_code TEXT UNIQUE NOT NULL,
  conservation_status TEXT,
  min_legal_size_cm NUMERIC(5,2)
);

-- VESSELS
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT UNIQUE NOT NULL,
  vessel_name TEXT NOT NULL,
  vessel_type TEXT,
  length_meters NUMERIC(6,2),
  tonnage NUMERIC(8,2),
  home_port TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP DEFAULT now()
);

-- CREW ASSIGNMENTS
CREATE TABLE crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  is_captain BOOLEAN DEFAULT false,
  assigned_date DATE,
  status TEXT CHECK (status IN ('active','inactive'))
);

-- QUOTAS
CREATE TABLE quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id),
  year INT NOT NULL,
  total_quota_kg INT NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('active','expired'))
);

-- SEASONAL RESTRICTIONS
CREATE TABLE seasonal_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id),
  region TEXT NOT NULL,
  ban_start_date DATE,
  ban_end_date DATE,
  year INT,
  reason TEXT
);

-- CATCH LOGS
CREATE TABLE catch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  captain_id UUID REFERENCES users(id),
  species_id UUID REFERENCES species(id),
  catch_date DATE NOT NULL,
  catch_time TIME NOT NULL,
  weight_kg INT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  fishing_zone TEXT,
  fishing_method TEXT,
  created_at TIMESTAMP DEFAULT now()
);
-- VIOLATIONS
CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  captain_id UUID REFERENCES users(id),
  species_id UUID REFERENCES species(id),

  violation_type TEXT NOT NULL,
  description TEXT,

  detected_at TIMESTAMP NOT NULL DEFAULT now(),
  violation_date DATE NOT NULL,

  severity TEXT CHECK (severity IN ('minor','major','critical')) NOT NULL,
  penalty_amount NUMERIC(12,2),

  status TEXT CHECK (status IN ('open','resolved','dismissed')) DEFAULT 'open',

  created_at TIMESTAMP DEFAULT now()
);
