import { pool } from '../config';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await client.query('TRUNCATE violations, catch_logs, seasonal_restrictions, quotas, crew_assignments, species, vessels, users CASCADE');

    // Seed Users
    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name)
      VALUES 
        ('admin@fisheries.com', $1, 'admin', 'Admin', 'User'),
        ('regulator@fisheries.com', $1, 'regulator', 'Jane', 'Regulator'),
        ('captain1@fisheries.com', $1, 'captain', 'John', 'Smith'),
        ('captain2@fisheries.com', $1, 'captain', 'Sarah', 'Johnson'),
        ('operator@fisheries.com', $1, 'operator', 'Mike', 'Operator')
      RETURNING id, email, role
    `, [passwordHash]);

    const users = usersResult.rows;
    console.log(`✅ Created ${users.length} users`);

    // Seed Species
    console.log('Seeding species...');
    const speciesResult = await client.query(`
      INSERT INTO species (common_name, scientific_name, species_code, conservation_status, min_legal_size_cm)
      VALUES 
        ('Atlantic Cod', 'Gadus morhua', 'COD', 'Vulnerable', 35.0),
        ('Haddock', 'Melanogrammus aeglefinus', 'HAD', 'Least Concern', 30.0),
        ('Atlantic Salmon', 'Salmo salar', 'SAL', 'Least Concern', 40.0),
        ('Yellowfin Tuna', 'Thunnus albacares', 'YFT', 'Near Threatened', 50.0),
        ('King Crab', 'Paralithodes camtschaticus', 'KCR', 'Least Concern', 15.0),
        ('Pollock', 'Pollachius pollachius', 'POL', 'Least Concern', 30.0),
        ('Herring', 'Clupea harengus', 'HER', 'Least Concern', 20.0),
        ('Mackerel', 'Scomber scombrus', 'MAC', 'Least Concern', 30.0)
      RETURNING id, common_name, species_code
    `);

    const species = speciesResult.rows;
    console.log(`✅ Created ${species.length} species`);

    // Seed Vessels
    console.log('Seeding vessels...');
    const vesselsResult = await client.query(`
      INSERT INTO vessels (registration_number, vessel_name, vessel_type, length_meters, tonnage, home_port, owner_id, status)
      VALUES 
        ('FV-2024-001', 'Northern Star', 'Trawler', 25.5, 150.0, 'Portland', $1, 'active'),
        ('FV-2024-002', 'Ocean Horizon', 'Longliner', 30.0, 200.0, 'Boston', $1, 'active'),
        ('FV-2024-003', 'Sea Ranger', 'Gillnetter', 20.0, 100.0, 'Seattle', $2, 'active'),
        ('FV-2024-004', 'Pacific Dream', 'Trawler', 28.0, 180.0, 'San Francisco', $2, 'active'),
        ('FV-2024-005', 'Blue Wave', 'Purse Seiner', 35.0, 250.0, 'Portland', $1, 'inactive')
      RETURNING id, vessel_name, registration_number
    `, [users[4].id, users[4].id]);

    const vessels = vesselsResult.rows;
    console.log(`✅ Created ${vessels.length} vessels`);

    // Assign crews
    console.log('Assigning crews...');
    await client.query(`
      INSERT INTO crew_assignments (vessel_id, user_id, role, is_captain, assigned_date, status)
      VALUES 
        ($1, $2, 'Captain', true, CURRENT_DATE - INTERVAL '6 months', 'active'),
        ($3, $4, 'Captain', true, CURRENT_DATE - INTERVAL '1 year', 'active')
    `, [vessels[0].id, users[2].id, vessels[1].id, users[3].id]);

    // Seed Quotas
    console.log('Seeding quotas...');
    const currentYear = new Date().getFullYear();
    
    for (const sp of species) {
      await client.query(`
        INSERT INTO quotas (species_id, year, total_quota_kg, vessel_id, start_date, end_date, status)
        VALUES 
          ($1, $2, $3, $4, $5, $6, 'active')
      `, [
        sp.id,
        currentYear,
        Math.floor(Math.random() * 50000) + 10000, // Random quota between 10,000 and 60,000 kg
        vessels[0].id,
        `${currentYear}-01-01`,
        `${currentYear}-12-31`
      ]);
    }
    console.log(`✅ Created quotas for ${species.length} species`);

    // Seed Seasonal Restrictions
    console.log('Seeding seasonal restrictions...');
    await client.query(`
      INSERT INTO seasonal_restrictions (species_id, region, ban_start_date, ban_end_date, year, reason)
      VALUES 
        ($1, 'North Atlantic', $2, $3, $4, 'Spawning season protection'),
        ($5, 'Pacific Northwest', $6, $7, $8, 'Conservation effort')
    `, [
      species[0].id, // Cod
      `${currentYear}-04-01`,
      `${currentYear}-06-30`,
      currentYear,
      species[3].id, // Tuna
      `${currentYear}-07-01`,
      `${currentYear}-09-30`,
      currentYear
    ]);

    // Seed Catch Logs
    console.log('Seeding catch logs...');
    const catchCount = 50;
    
    for (let i = 0; i < catchCount; i++) {
      const randomSpecies = species[Math.floor(Math.random() * species.length)];
      const randomVessel = vessels[Math.floor(Math.random() * Math.min(vessels.length, 4))];
      const daysAgo = Math.floor(Math.random() * 90);
      const catchDate = new Date();
      catchDate.setDate(catchDate.getDate() - daysAgo);

      await client.query(`
        INSERT INTO catch_logs (
          vessel_id, captain_id, species_id, catch_date, catch_time,
          weight_kg, latitude, longitude, fishing_zone, fishing_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        randomVessel.id,
        users[2].id,
        randomSpecies.id,
        catchDate.toISOString().split('T')[0],
        `${Math.floor(Math.random() * 12) + 6}:${Math.floor(Math.random() * 60)}:00`,
        Math.floor(Math.random() * 5000) + 100, // 100-5100 kg
        (Math.random() * 20 + 35).toFixed(6), // Latitude
        (Math.random() * 40 - 80).toFixed(6), // Longitude
        `Zone ${Math.floor(Math.random() * 5) + 1}`,
        ['Trawling', 'Longlining', 'Gillnetting', 'Purse Seining'][Math.floor(Math.random() * 4)]
      ]);
    }
    console.log(`✅ Created ${catchCount} catch logs`);

    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Email: admin@fisheries.com | Password: password123');
    console.log('Email: captain1@fisheries.com | Password: password123');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();