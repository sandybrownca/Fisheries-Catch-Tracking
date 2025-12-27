import { pool } from '../db/config';
import { Species } from '../types';

export class SpeciesService {
  
  async createSpecies(data: {
    common_name: string;
    scientific_name?: string;
    species_code: string;
    conservation_status?: string;
    min_legal_size_cm?: number;
  }): Promise<Species> {
    const query = `
      INSERT INTO species (
        common_name, scientific_name, species_code, 
        conservation_status, min_legal_size_cm
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.common_name,
      data.scientific_name || null,
      data.species_code,
      data.conservation_status || null,
      data.min_legal_size_cm || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getSpeciesById(id: string): Promise<Species | null> {
    const query = 'SELECT * FROM species WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllSpecies(filters?: {
    conservation_status?: string;
    search?: string;
  }): Promise<Species[]> {
    let query = 'SELECT * FROM species WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.conservation_status) {
      query += ` AND conservation_status = $${paramCount}`;
      values.push(filters.conservation_status);
      paramCount++;
    }

    if (filters?.search) {
      query += ` AND (common_name ILIKE $${paramCount} OR scientific_name ILIKE $${paramCount} OR species_code ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY common_name ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async updateSpecies(id: string, updates: Partial<Species>): Promise<Species> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['common_name', 'scientific_name', 'species_code', 'conservation_status', 'min_legal_size_cm'];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE species 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Species not found');
    }

    return result.rows[0];
  }

  async deleteSpecies(id: string): Promise<boolean> {
    // Check if species has any catch logs
    const checkQuery = 'SELECT COUNT(*) as count FROM catch_logs WHERE species_id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete species with existing catch logs');
    }

    const query = 'DELETE FROM species WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSpeciesWithStats(id: string, year?: number): Promise<any> {
    const species = await this.getSpeciesById(id);
    if (!species) return null;

    const currentYear = year || new Date().getFullYear();

    // Get catch statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_catches,
        SUM(weight_kg) as total_weight_kg,
        AVG(weight_kg) as avg_weight_per_catch,
        MIN(catch_date) as first_catch_date,
        MAX(catch_date) as last_catch_date
      FROM catch_logs
      WHERE species_id = $1
        AND EXTRACT(YEAR FROM catch_date) = $2
    `;
    
    const statsResult = await pool.query(statsQuery, [id, currentYear]);
    const stats = statsResult.rows[0];

    // Get quota information
    const quotaQuery = `
      SELECT 
        SUM(total_quota_kg) as total_quota_kg,
        COUNT(*) as quota_count
      FROM quotas
      WHERE species_id = $1 AND year = $2 AND status = 'active'
    `;
    
    const quotaResult = await pool.query(quotaQuery, [id, currentYear]);
    const quota = quotaResult.rows[0];

    // Get violation count
    const violationQuery = `
      SELECT COUNT(*) as violation_count
      FROM violations v
      JOIN catch_logs cl ON v.catch_log_id = cl.id
      WHERE cl.species_id = $1
        AND EXTRACT(YEAR FROM v.detected_at) = $2
    `;
    
    const violationResult = await pool.query(violationQuery, [id, currentYear]);
    const violations = violationResult.rows[0];

    return {
      ...species,
      statistics: {
        year: currentYear,
        total_catches: parseInt(stats.total_catches) || 0,
        total_weight_kg: parseFloat(stats.total_weight_kg) || 0,
        avg_weight_per_catch: parseFloat(stats.avg_weight_per_catch) || 0,
        first_catch_date: stats.first_catch_date,
        last_catch_date: stats.last_catch_date,
        total_quota_kg: parseFloat(quota.total_quota_kg) || 0,
        quota_count: parseInt(quota.quota_count) || 0,
        violation_count: parseInt(violations.violation_count) || 0
      }
    };
  }

  async getTopSpeciesByCatch(year?: number, limit: number = 10): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();
    
    const query = `
      SELECT 
        s.id,
        s.common_name,
        s.scientific_name,
        s.species_code,
        s.conservation_status,
        SUM(cl.weight_kg) as total_catch_kg,
        COUNT(*) as catch_count,
        COUNT(DISTINCT cl.vessel_id) as vessel_count
      FROM species s
      JOIN catch_logs cl ON s.id = cl.species_id
      WHERE EXTRACT(YEAR FROM cl.catch_date) = $1
      GROUP BY s.id, s.common_name, s.scientific_name, s.species_code, s.conservation_status
      ORDER BY total_catch_kg DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [currentYear, limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      common_name: row.common_name,
      scientific_name: row.scientific_name,
      species_code: row.species_code,
      conservation_status: row.conservation_status,
      total_catch_kg: parseFloat(row.total_catch_kg),
      catch_count: parseInt(row.catch_count),
      vessel_count: parseInt(row.vessel_count)
    }));
  }
}

export default new SpeciesService();