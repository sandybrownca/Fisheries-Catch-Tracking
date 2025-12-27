import { pool } from '../db/config';
import { CatchLog, CreateCatchLogDTO } from '../types';
import { checkViolations } from './violationService';

export class CatchService {

  async createCatchLog(data: CreateCatchLogDTO): Promise<CatchLog> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert catch log (immutable)
      const insertQuery = `
        INSERT INTO catch_logs (
          vessel_id, captain_id, species_id, catch_date, catch_time,
          weight_kg, latitude, longitude, fishing_zone, fishing_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        data.vessel_id,
        data.captain_id || null,
        data.species_id,
        data.catch_date,
        data.catch_time,
        data.weight_kg,
        data.latitude,
        data.longitude,
        data.fishing_zone || null,
        data.fishing_method || null,
        data.notes || null
      ];

      const result = await client.query(insertQuery, values);
      const catchLog = result.rows[0];

      // Check for violations automatically
      await checkViolations(catchLog, client);

      await client.query('COMMIT');
      return catchLog;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCatchLogById(id: string): Promise<any | null> {
    const query = `
      SELECT 
        cl.*,
        s.common_name as species_name,
        s.species_code,
        v.vessel_name,
        v.registration_number,
        u.first_name as captain_first_name,
        u.last_name as captain_last_name
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      JOIN vessels v ON cl.vessel_id = v.id
      LEFT JOIN users u ON cl.captain_id = u.id
      WHERE cl.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getCatchLogs(filters?: {
    vessel_id?: string;
    species_id?: string;
    start_date?: string;
    end_date?: string;
    is_verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[], total: number }> {
    let query = `
      SELECT 
        cl.*,
        s.common_name as species_name,
        s.species_code,
        v.vessel_name,
        v.registration_number,
        u.first_name as captain_first_name,
        u.last_name as captain_last_name
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      JOIN vessels v ON cl.vessel_id = v.id
      LEFT JOIN users u ON cl.captain_id = u.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.vessel_id) {
      query += ` AND cl.vessel_id = $${paramCount}`;
      values.push(filters.vessel_id);
      paramCount++;
    }

    if (filters?.species_id) {
      query += ` AND cl.species_id = $${paramCount}`;
      values.push(filters.species_id);
      paramCount++;
    }

    if (filters?.start_date) {
      query += ` AND cl.catch_date >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      query += ` AND cl.catch_date <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    if (filters?.is_verified !== undefined) {
      query += ` AND cl.is_verified = $${paramCount}`;
      values.push(filters.is_verified);
      paramCount++;
    }

    // Get total count
    const countQuery = `
  SELECT COUNT(*) AS total_count
  FROM (${query}) AS subquery
`;
    const countResult = await pool.query(countQuery, values);
    //console.log(JSON.stringify(countResult));
    const total = parseInt(countResult.rows[0]?.total_count || '0');

    // Add sorting and pagination
    query += ` ORDER BY cl.catch_date DESC, cl.catch_time DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return { data: result.rows, total };
  }

  async verifyCatchLog(id: string, verifiedBy: string): Promise<CatchLog> {
    const query = `
      UPDATE catch_logs
      SET is_verified = true, verified_by = $1, verified_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_verified = false
      RETURNING *
    `;

    const result = await pool.query(query, [verifiedBy, id]);

    if (result.rows.length === 0) {
      throw new Error('Catch log not found or already verified');
    }

    return result.rows[0];
  }

  async getCatchLogsByVessel(vesselId: string, limit: number = 50): Promise<any[]> {
    const query = `
      SELECT 
        cl.*,
        s.common_name as species_name,
        s.species_code
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      WHERE cl.vessel_id = $1
      ORDER BY cl.catch_date DESC, cl.catch_time DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [vesselId, limit]);
    return result.rows;
  }

  async getCatchLogsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const query = `
      SELECT 
        cl.*,
        s.common_name as species_name,
        s.species_code,
        v.vessel_name,
        v.registration_number
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      JOIN vessels v ON cl.vessel_id = v.id
      WHERE cl.catch_date >= $1 AND cl.catch_date <= $2
      ORDER BY cl.catch_date DESC, cl.catch_time DESC
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  async getTotalCatchBySpecies(speciesId: string, year: number, vesselId?: string): Promise<number> {
    let query = `
      SELECT COALESCE(SUM(weight_kg), 0) as total_catch
      FROM catch_logs
      WHERE species_id = $1 
      AND EXTRACT(YEAR FROM catch_date) = $2
    `;

    const values: any[] = [speciesId, year];

    if (vesselId) {
      query += ' AND vessel_id = $3';
      values.push(vesselId);
    }

    const result = await pool.query(query, values);
    return parseFloat(result.rows[0].total_catch);
  }

  async getCatchLocationData(filters?: {
    start_date?: string;
    end_date?: string;
    species_id?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        cl.id,
        cl.latitude,
        cl.longitude,
        cl.weight_kg,
        cl.catch_date,
        s.common_name as species_name,
        v.vessel_name
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      JOIN vessels v ON cl.vessel_id = v.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.start_date) {
      query += ` AND cl.catch_date >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      query += ` AND cl.catch_date <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    if (filters?.species_id) {
      query += ` AND cl.species_id = $${paramCount}`;
      values.push(filters.species_id);
      paramCount++;
    }

    query += ' ORDER BY cl.catch_date DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }
}

export default new CatchService();