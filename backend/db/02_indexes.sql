-- USERS
CREATE INDEX idx_users_role ON users(role);

-- VESSELS
CREATE INDEX idx_vessels_owner ON vessels(owner_id);
CREATE INDEX idx_vessels_status ON vessels(status);

-- CREW
CREATE INDEX idx_crew_vessel ON crew_assignments(vessel_id);
CREATE INDEX idx_crew_user ON crew_assignments(user_id);

-- QUOTAS
CREATE INDEX idx_quotas_species_year ON quotas(species_id, year);
CREATE INDEX idx_quotas_vessel ON quotas(vessel_id);

-- CATCH LOGS
CREATE INDEX idx_catch_date ON catch_logs(catch_date);
CREATE INDEX idx_catch_species ON catch_logs(species_id);
CREATE INDEX idx_catch_vessel ON catch_logs(vessel_id);

-- SEASONAL RESTRICTIONS
CREATE INDEX idx_restrictions_species_year ON seasonal_restrictions(species_id, year);

-- VIOLATIONS
CREATE INDEX idx_violations_vessel ON violations(vessel_id);
CREATE INDEX idx_violations_species ON violations(species_id);
CREATE INDEX idx_violations_date ON violations(violation_date);
CREATE INDEX idx_violations_status ON violations(status);
