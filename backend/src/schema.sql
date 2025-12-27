-- Database Schema for Fisheries Catch Tracking System

-- Users (Vessel operators, captains, regulators)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('operator', 'captain', 'regulator', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vessels
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    vessel_name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(100),
    length_meters DECIMAL(10, 2),
    tonnage DECIMAL(10, 2),
    home_port VARCHAR(255),
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crew assignments
CREATE TABLE crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    is_captain BOOLEAN DEFAULT false,
    assigned_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vessel_id, user_id, assigned_date)
);

-- Species master data
CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    species_code VARCHAR(50) UNIQUE NOT NULL,
    conservation_status VARCHAR(100),
    min_legal_size_cm DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotas (annual limits per species)
CREATE TABLE quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID REFERENCES species(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_quota_kg DECIMAL(15, 2) NOT NULL,
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(species_id, year, vessel_id)
);

-- Seasonal restrictions
CREATE TABLE seasonal_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID REFERENCES species(id) ON DELETE CASCADE,
    region VARCHAR(255),
    ban_start_date DATE NOT NULL,
    ban_end_date DATE NOT NULL,
    year INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catch logs (immutable records)
CREATE TABLE catch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    captain_id UUID REFERENCES users(id),
    species_id UUID REFERENCES species(id) ON DELETE CASCADE,
    catch_date DATE NOT NULL,
    catch_time TIME NOT NULL,
    weight_kg DECIMAL(15, 2) NOT NULL CHECK (weight_kg > 0),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    fishing_zone VARCHAR(100),
    fishing_method VARCHAR(100),
    notes TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Immutable: no updates allowed, only inserts
    CHECK (created_at IS NOT NULL)
);

-- Violations (automatic flags)
CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catch_log_id UUID REFERENCES catch_logs(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    violation_type VARCHAR(100) NOT NULL CHECK (
        violation_type IN ('quota_exceeded', 'seasonal_ban', 'undersized_catch', 'restricted_zone', 'unreported_catch')
    ),
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vessels_status ON vessels(status);
CREATE INDEX idx_vessels_owner ON vessels(owner_id);
CREATE INDEX idx_crew_vessel ON crew_assignments(vessel_id);
CREATE INDEX idx_crew_user ON crew_assignments(user_id);
CREATE INDEX idx_quotas_species_year ON quotas(species_id, year);
CREATE INDEX idx_quotas_vessel ON quotas(vessel_id);
CREATE INDEX idx_catch_vessel_date ON catch_logs(vessel_id, catch_date);
CREATE INDEX idx_catch_species ON catch_logs(species_id);
CREATE INDEX idx_catch_location ON catch_logs(latitude, longitude);
CREATE INDEX idx_violations_vessel ON violations(vessel_id);
CREATE INDEX idx_violations_resolved ON violations(resolved);
CREATE INDEX idx_seasonal_restrictions_species ON seasonal_restrictions(species_id, year);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_species_updated_at BEFORE UPDATE ON species
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotas_updated_at BEFORE UPDATE ON quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();