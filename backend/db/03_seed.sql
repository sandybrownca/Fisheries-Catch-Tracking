-- USERS
INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES
('admin@fisheries.com', 'hashed_password', 'admin', 'Admin', 'User'),
('regulator@fisheries.com', 'hashed_password', 'regulator', 'Jane', 'Regulator'),
('captain1@fisheries.com', 'hashed_password', 'captain', 'John', 'Smith'),
('captain2@fisheries.com', 'hashed_password', 'captain', 'Sarah', 'Johnson'),
('operator@fisheries.com', 'hashed_password', 'operator', 'Mike', 'Operator');

-- SPECIES
INSERT INTO species (common_name, scientific_name, species_code, conservation_status, min_legal_size_cm)
VALUES
('Atlantic Cod','Gadus morhua','COD','Vulnerable',35),
('Haddock','Melanogrammus aeglefinus','HAD','Least Concern',30),
('Atlantic Salmon','Salmo salar','SAL','Least Concern',40),
('Yellowfin Tuna','Thunnus albacares','YFT','Near Threatened',50),
('King Crab','Paralithodes camtschaticus','KCR','Least Concern',15),
('Pollock','Pollachius pollachius','POL','Least Concern',30),
('Herring','Clupea harengus','HER','Least Concern',20),
('Mackerel','Scomber scombrus','MAC','Least Concern',30);

-- VESSELS
INSERT INTO vessels (
  registration_number, vessel_name, vessel_type,
  length_meters, tonnage, home_port, owner_id, status
)
SELECT
  'FV-2024-001','Northern Star','Trawler',25.5,150,'Portland',u.id,'active'
FROM users u WHERE u.role='admin'
LIMIT 1;

INSERT INTO public.violations (
  vessel_id,
  captain_id,
  species_id,
  violation_type,
  description,
  detected_at,
  violation_date,
  severity,
  penalty_amount,
  status
)
VALUES
-- Northern Star
('2dfd584d-18d2-48b0-8aaa-f619cc40d9a4', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Overfishing', 'Exceeded allocated quota by 12%', '2025-01-03 10:15', '2025-01-03', 'major', 25000.00, 'open'),

('2dfd584d-18d2-48b0-8aaa-f619cc40d9a4', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Logbook Violation', 'Incomplete catch log entries', '2025-01-05 09:20', '2025-01-05', 'minor', 2500.00, 'resolved'),

('2dfd584d-18d2-48b0-8aaa-f619cc40d9a4', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Area Violation', 'Fishing in restricted marine zone', '2025-01-07 16:55', '2025-01-07', 'major', 30000.00, 'open'),

('2dfd584d-18d2-48b0-8aaa-f619cc40d9a4', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Reporting Delay', 'Late compliance submission', '2025-01-09 08:10', '2025-01-09', 'minor', 2200.00, 'resolved'),

-- Ocean Horizon
('ecfe6f67-50ae-410b-8182-cc677be92060', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Illegal Gear', 'Use of unauthorized longline hooks', '2025-01-04 11:40', '2025-01-04', 'major', 12000.00, 'open'),

('ecfe6f67-50ae-410b-8182-cc677be92060', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Permit Violation', 'Expired fishing permit', '2025-01-06 07:50', '2025-01-06', 'minor', 8000.00, 'resolved'),

('ecfe6f67-50ae-410b-8182-cc677be92060', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Overfishing', 'Exceeded species-specific quota', '2025-01-08 15:00', '2025-01-08', 'major', 22000.00, 'open'),

('ecfe6f67-50ae-410b-8182-cc677be92060', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Tampering', 'Tracking device interference detected', '2025-01-10 22:10', '2025-01-10', 'critical', 60000.00, 'open'),

-- Sea Ranger
('ccb643bc-2bf9-4c05-929c-bb9decff8d9c', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Bycatch Violation', 'Excessive bycatch recorded', '2025-01-05 13:40', '2025-01-05', 'major', 11000.00, 'open'),

('ccb643bc-2bf9-4c05-929c-bb9decff8d9c', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Logbook Violation', 'Incorrect species classification', '2025-01-07 09:35', '2025-01-07', 'minor', 7000.00, 'resolved'),

('ccb643bc-2bf9-4c05-929c-bb9decff8d9c', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Area Violation', 'Entered seasonal no-fishing zone', '2025-01-09 06:30', '2025-01-09', 'major', 28000.00, 'open'),

('ccb643bc-2bf9-4c05-929c-bb9decff8d9c', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Documentation', 'Missing onboard documentation', '2025-01-11 10:10', '2025-01-11', 'minor', 3000.00, 'dismissed'),

-- Pacific Dream
('a44aeba2-4446-4a1d-8cf1-f6a1a83f8ef3', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Protected Species', 'Caught protected species during haul', '2025-01-06 14:30', '2025-01-06', 'critical', 50000.00, 'open'),

('a44aeba2-4446-4a1d-8cf1-f6a1a83f8ef3', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Illegal Gear', 'Mesh size below regulation limit', '2025-01-08 12:15', '2025-01-08', 'major', 9000.00, 'open'),

('a44aeba2-4446-4a1d-8cf1-f6a1a83f8ef3', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Reporting Delay', 'Late weekly report submission', '2025-01-10 18:25', '2025-01-10', 'minor', 1800.00, 'resolved'),

('a44aeba2-4446-4a1d-8cf1-f6a1a83f8ef3', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Overfishing', 'Exceeded daily catch limit', '2025-01-12 11:05', '2025-01-12', 'major', 15000.00, 'open'),

-- Blue Wave
('12443d92-6d73-4737-83ba-5ca4520c830d', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Permit Violation', 'Operating while vessel inactive', '2025-01-07 14:00', '2025-01-07', 'major', 20000.00, 'open'),

('12443d92-6d73-4737-83ba-5ca4520c830d', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Tampering', 'GPS signal interruption detected', '2025-01-09 23:50', '2025-01-09', 'critical', 65000.00, 'open'),

('12443d92-6d73-4737-83ba-5ca4520c830d', 'e0546293-2144-49a8-829e-fd58952dc296', NULL,
 'Bycatch Violation', 'Unreported bycatch incident', '2025-01-11 19:20', '2025-01-11', 'major', 13000.00, 'open'),

('12443d92-6d73-4737-83ba-5ca4520c830d', '34216ab4-70e2-4091-ae86-8201a25b327c', NULL,
 'Documentation', 'Missing safety inspection certificate', '2025-01-13 08:45', '2025-01-13', 'minor', 4000.00, 'dismissed');
