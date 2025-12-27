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
