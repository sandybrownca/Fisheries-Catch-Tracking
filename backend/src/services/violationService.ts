import { PoolClient } from 'pg';
import { pool } from '../db/config';
import { Quota, SeasonalRestriction, Violation, CreateQuotaDTO, CreateSeasonalRestrictionDTO, CatchLog } from '../types';

export class QuotaService {
  
  async createQuota(data: CreateQuotaDTO): Promise<Quota> {
    const query = `
      INSERT INTO quotas (
        species_id, year, total_quota_kg, vessel_id, start_date, end_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING *
    `;

    const values = [
      data.species_id,
      data.year,
      data.total_quota_kg,
      data.vessel_id || null,
      data.start_date,
      data.end_date
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getQuotas(filters?: {
    species_id?: string;
    year?: number;
    vessel_id?: string;
    status?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        q.*,
        s.common_name as species_name,
        s.species_code,
        v.vessel_name,
        v.registration_number
      FROM quotas q
      JOIN species s ON q.species_id = s.id
      LEFT JOIN vessels v ON q.vessel_id = v.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.species_id) {
      query += ` AND q.species_id = $${paramCount}`;
      values.push(filters.species_id);
      paramCount++;
    }

    if (filters?.year) {
      query += ` AND q.year = $${paramCount}`;
      values.push(filters.year);
      paramCount++;
    }

    if (filters?.vessel_id) {
      query += ` AND q.vessel_id = $${paramCount}`;
      values.push(filters.vessel_id);
      paramCount++;
    }

    if (filters?.status) {
      query += ` AND q.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY q.year DESC, s.common_name ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async updateQuota(id: string, updates: Partial<CreateQuotaDTO>): Promise<Quota> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE quotas 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Quota not found');
    }

    return result.rows[0];
  }

  async createSeasonalRestriction(data: CreateSeasonalRestrictionDTO): Promise<SeasonalRestriction> {
    const query = `
      INSERT INTO seasonal_restrictions (
        species_id, region, ban_start_date, ban_end_date, year, reason
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.species_id,
      data.region || null,
      data.ban_start_date,
      data.ban_end_date,
      data.year,
      data.reason || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getSeasonalRestrictions(filters?: {
    species_id?: string;
    year?: number;
    active_on_date?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        sr.*,
        s.common_name as species_name,
        s.species_code
      FROM seasonal_restrictions sr
      JOIN species s ON sr.species_id = s.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.species_id) {
      query += ` AND sr.species_id = $${paramCount}`;
      values.push(filters.species_id);
      paramCount++;
    }

    if (filters?.year) {
      query += ` AND sr.year = $${paramCount}`;
      values.push(filters.year);
      paramCount++;
    }

    if (filters?.active_on_date) {
      query += ` AND $${paramCount}::date BETWEEN sr.ban_start_date AND sr.ban_end_date`;
      values.push(filters.active_on_date);
      paramCount++;
    }

    query += ' ORDER BY sr.ban_start_date DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async checkQuotaExceeded(
    speciesId: string,
    year: number,
    vesselId?: string
  ): Promise<{ exceeded: boolean; current: number; quota: number }> {
    // Get quota
    const quotaQuery = vesselId
      ? 'SELECT total_quota_kg FROM quotas WHERE species_id = $1 AND year = $2 AND vessel_id = $3 AND status = $4'
      : 'SELECT total_quota_kg FROM quotas WHERE species_id = $1 AND year = $2 AND vessel_id IS NULL AND status = $3';

    const quotaValues = vesselId 
      ? [speciesId, year, vesselId, 'active']
      : [speciesId, year, 'active'];

    const quotaResult = await pool.query(quotaQuery, quotaValues);
    
    if (quotaResult.rows.length === 0) {
      return { exceeded: false, current: 0, quota: 0 };
    }

    const quota = parseFloat(quotaResult.rows[0].total_quota_kg);

    // Get current catch
    let catchQuery = `
      SELECT COALESCE(SUM(weight_kg), 0) as total_catch
      FROM catch_logs
      WHERE species_id = $1 AND EXTRACT(YEAR FROM catch_date) = $2
    `;

    const catchValues: any[] = [speciesId, year];

    if (vesselId) {
      catchQuery += ' AND vessel_id = $3';
      catchValues.push(vesselId);
    }

    const catchResult = await pool.query(catchQuery, catchValues);
    const current = parseFloat(catchResult.rows[0].total_catch);

    return {
      exceeded: current > quota,
      current,
      quota
    };
  }
}

export async function checkViolations(catchLog: CatchLog, client: PoolClient): Promise<void> {
  const violations: Array<{ type: string; severity: string; description: string }> = [];

  // Check quota violations
  const year = new Date(catchLog.catch_date).getFullYear();
  
  const quotaCheckQuery = `
    SELECT 
      q.total_quota_kg,
      COALESCE(SUM(cl.weight_kg), 0) as current_catch
    FROM quotas q
    LEFT JOIN catch_logs cl ON cl.species_id = q.species_id 
      AND EXTRACT(YEAR FROM cl.catch_date) = q.year
      AND cl.vessel_id = q.vessel_id
    WHERE q.species_id = $1 
      AND q.year = $2 
      AND q.vessel_id = $3
      AND q.status = 'active'
    GROUP BY q.total_quota_kg
  `;

  const quotaResult = await client.query(quotaCheckQuery, [
    catchLog.species_id,
    year,
    catchLog.vessel_id
  ]);

  if (quotaResult.rows.length > 0) {
    const { total_quota_kg, current_catch } = quotaResult.rows[0];
    const newTotal = parseFloat(current_catch) + catchLog.weight_kg;
    
    if (newTotal > parseFloat(total_quota_kg)) {
      const exceededBy = newTotal - parseFloat(total_quota_kg);
      violations.push({
        type: 'quota_exceeded',
        severity: exceededBy > total_quota_kg * 0.1 ? 'critical' : 'high',
        description: `Quota exceeded by ${exceededBy.toFixed(2)} kg. Current: ${newTotal.toFixed(2)} kg, Quota: ${total_quota_kg} kg`
      });
    }
  }

  // Check seasonal restrictions
  const restrictionQuery = `
    SELECT * FROM seasonal_restrictions
    WHERE species_id = $1
      AND year = $2
      AND $3::date BETWEEN ban_start_date AND ban_end_date
  `;

  const restrictionResult = await client.query(restrictionQuery, [
    catchLog.species_id,
    year,
    catchLog.catch_date
  ]);

  if (restrictionResult.rows.length > 0) {
    const restriction = restrictionResult.rows[0];
    violations.push({
      type: 'seasonal_ban',
      severity: 'critical',
      description: `Catch made during seasonal ban period (${restriction.ban_start_date} to ${restriction.ban_end_date}). Reason: ${restriction.reason || 'Regulatory restriction'}`
    });
  }

  // Insert violations
  for (const violation of violations) {
    const insertQuery = `
      INSERT INTO violations (
        catch_log_id, vessel_id, violation_type, severity, description
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(insertQuery, [
      catchLog.id,
      catchLog.vessel_id,
      violation.type,
      violation.severity,
      violation.description
    ]);
  }
}

export class ViolationService {
  
  async getViolations(filters?: {
    vessel_id?: string;
    resolved?: boolean;
    severity?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        v.*,
        ve.vessel_name,
        ve.registration_number,
        s.common_name as species_name,
        cl.catch_date,
        cl.weight_kg
      FROM violations v
      JOIN vessels ve ON v.vessel_id = ve.id
      LEFT JOIN catch_logs cl ON v.catch_log_id = cl.id
      LEFT JOIN species s ON cl.species_id = s.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.vessel_id) {
      query += ` AND v.vessel_id = $${paramCount}`;
      values.push(filters.vessel_id);
      paramCount++;
    }

    if (filters?.resolved !== undefined) {
      query += ` AND v.resolved = $${paramCount}`;
      values.push(filters.resolved);
      paramCount++;
    }

    if (filters?.severity) {
      query += ` AND v.severity = $${paramCount}`;
      values.push(filters.severity);
      paramCount++;
    }

    if (filters?.start_date) {
      query += ` AND v.detected_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      query += ` AND v.detected_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    query += ' ORDER BY v.detected_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async resolveViolation(id: string, resolvedBy: string, notes?: string): Promise<Violation> {
    const query = `
      UPDATE violations
      SET resolved = true, resolved_at = CURRENT_TIMESTAMP, 
          resolved_by = $1, resolution_notes = $2
      WHERE id = $3 AND resolved = false
      RETURNING *
    `;

    const result = await pool.query(query, [resolvedBy, notes || null, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Violation not found or already resolved');
    }

    return result.rows[0];
  }
}

export const quotaService = new QuotaService();
export const violationService = new ViolationService();