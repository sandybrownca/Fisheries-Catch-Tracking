import { pool } from '../db/config';
import { CatchVsQuotaData, SpeciesTrendData, DashboardStats } from '../types';

export class DashboardService {

  async getDashboardStats(year?: number): Promise<DashboardStats> {
    const currentYear = year || new Date().getFullYear();

    // Total and active vessels
    const vesselsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active
      FROM vessels
    `;
    const vesselsResult = await pool.query(vesselsQuery);
    const vessels = vesselsResult.rows[0];

    // Catch statistics
    const catchQuery = `
      SELECT 
        COALESCE(SUM(weight_kg) FILTER (WHERE catch_date = CURRENT_DATE), 0) as today,
        COALESCE(SUM(weight_kg) FILTER (WHERE 
          EXTRACT(YEAR FROM catch_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND
          EXTRACT(MONTH FROM catch_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        ), 0) as this_month,
        COALESCE(SUM(weight_kg) FILTER (WHERE EXTRACT(YEAR FROM catch_date) = $1), 0) as this_year
      FROM catch_logs
    `;
    const catchResult = await pool.query(catchQuery, [currentYear]);
    const catchStats = catchResult.rows[0];

    // Violation statistics
    const violationsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as active,
        COUNT(*) FILTER (WHERE status = 'open' AND severity = 'critical') as critical
      FROM violations
    `;
    const violationsResult = await pool.query(violationsQuery);
    const violations = violationsResult.rows[0];

    // Quota compliance rate
    const complianceQuery = `
      WITH quota_status AS (
        SELECT 
          q.id,
          q.total_quota_kg,
          COALESCE(SUM(cl.weight_kg), 0) as current_catch
        FROM quotas q
        LEFT JOIN catch_logs cl ON cl.species_id = q.species_id 
          AND EXTRACT(YEAR FROM cl.catch_date) = q.year
          AND (q.vessel_id IS NULL OR cl.vessel_id = q.vessel_id)
        WHERE q.year = $1 AND q.status = 'active'
        GROUP BY q.id, q.total_quota_kg
      )
      SELECT 
        COUNT(*) as total_quotas,
        COUNT(*) FILTER (WHERE current_catch <= total_quota_kg) as compliant_quotas
      FROM quota_status
    `;
    const complianceResult = await pool.query(complianceQuery, [currentYear]);
    const compliance = complianceResult.rows[0];

    const complianceRate = compliance.total_quotas > 0
      ? (parseInt(compliance.compliant_quotas) / parseInt(compliance.total_quotas)) * 100
      : 100;
    console.log("vessels.total ", vessels.total);
    return {
      total_vessels: parseInt(vessels.total),
      active_vessels: parseInt(vessels.active),
      total_catch_today: parseFloat(catchStats.today),
      total_catch_this_month: parseFloat(catchStats.this_month),
      total_catch_this_year: parseFloat(catchStats.this_year),
      active_violations: parseInt(violations.active),
      critical_violations: parseInt(violations.critical),
      quota_compliance_rate: parseFloat(complianceRate.toFixed(2))
    };
  }

  async getCatchVsQuotaData(year?: number, vesselId?: string): Promise<CatchVsQuotaData[]> {
    const currentYear = year || new Date().getFullYear();

    let query = `
      WITH catch_totals AS (
        SELECT 
          species_id,
          COALESCE(SUM(weight_kg), 0) as total_catch_kg
        FROM catch_logs
        WHERE EXTRACT(YEAR FROM catch_date) = $1
    `;

    const values: any[] = [currentYear];
    let paramCount = 2;

    if (vesselId) {
      query += ` AND vessel_id = $${paramCount}`;
      values.push(vesselId);
      paramCount++;
    }

    query += `
        GROUP BY species_id
      )
      SELECT 
        s.id as species_id,
        s.common_name as species_name,
        COALESCE(ct.total_catch_kg, 0) as total_catch_kg,
        q.total_quota_kg as quota_kg,
        CASE 
          WHEN q.total_quota_kg > 0 THEN 
            (COALESCE(ct.total_catch_kg, 0) / q.total_quota_kg * 100)
          ELSE 0
        END as percentage_used,
        CASE 
          WHEN COALESCE(ct.total_catch_kg, 0) > q.total_quota_kg THEN 'exceeded'
          WHEN (COALESCE(ct.total_catch_kg, 0) / q.total_quota_kg) >= 0.9 THEN 'critical'
          WHEN (COALESCE(ct.total_catch_kg, 0) / q.total_quota_kg) >= 0.75 THEN 'warning'
          ELSE 'safe'
        END as status
      FROM quotas q
      JOIN species s ON q.species_id = s.id
      LEFT JOIN catch_totals ct ON ct.species_id = s.id
      WHERE q.year = $1 AND q.status = 'active'
    `;

    if (vesselId) {
      query += ` AND q.vessel_id = $${paramCount}`;
      values.push(vesselId);
    }
    /*
    else {
      query += ' AND q.vessel_id IS NULL';
    }
    */
    query += ' ORDER BY percentage_used DESC';

    const result = await pool.query(query, values);
    //console.log(query);
    //console.log(values);
    return result.rows.map(row => ({
      species_id: row.species_id,
      species_name: row.species_name,
      total_catch_kg: parseFloat(row.total_catch_kg),
      quota_kg: parseFloat(row.quota_kg),
      percentage_used: parseFloat(row.percentage_used),
      status: row.status
    }));
  }

  async getSpeciesTrendData(
    speciesId: string,
    startDate: string,
    endDate: string,
    vesselId?: string
  ): Promise<SpeciesTrendData> {
    let query = `
      SELECT 
        TO_CHAR(catch_date, 'YYYY-MM') as month,
        SUM(weight_kg) as total_kg,
        COUNT(*) as catch_count
      FROM catch_logs
      WHERE species_id = $1
        AND catch_date >= $2
        AND catch_date <= $3
    `;

    const values: any[] = [speciesId, startDate, endDate];
    let paramCount = 4;

    if (vesselId) {
      query += ` AND vessel_id = $${paramCount}`;
      values.push(vesselId);
      paramCount++;
    }

    query += `
      GROUP BY TO_CHAR(catch_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const result = await pool.query(query, values);

    // Get species name
    const speciesQuery = 'SELECT common_name FROM species WHERE id = $1';
    const speciesResult = await pool.query(speciesQuery, [speciesId]);
    const speciesName = speciesResult.rows[0]?.common_name || 'Unknown';

    return {
      species_id: speciesId,
      species_name: speciesName,
      monthly_catches: result.rows.map(row => ({
        month: row.month,
        total_kg: parseFloat(row.total_kg),
        catch_count: parseInt(row.catch_count)
      }))
    };
  }

  async getOverfishingAlerts(year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();

    const query = `
      WITH catch_totals AS (
        SELECT 
          species_id,
          vessel_id,
          SUM(weight_kg) as total_catch_kg
        FROM catch_logs
        WHERE EXTRACT(YEAR FROM catch_date) = $1
        GROUP BY species_id, vessel_id
      )
      SELECT 
        s.common_name as species_name,
        v.vessel_name,
        v.registration_number,
        ct.total_catch_kg,
        q.total_quota_kg,
        (ct.total_catch_kg - q.total_quota_kg) as exceeded_by_kg,
        ((ct.total_catch_kg / q.total_quota_kg - 1) * 100) as exceeded_percentage
      FROM catch_totals ct
      JOIN quotas q ON ct.species_id = q.species_id 
        AND (q.vessel_id IS NULL OR ct.vessel_id = q.vessel_id)
      JOIN species s ON ct.species_id = s.id
      JOIN vessels v ON ct.vessel_id = v.id
      WHERE q.year = $1 
        AND q.status = 'active'
        AND ct.total_catch_kg > q.total_quota_kg
      ORDER BY exceeded_percentage DESC
    `;

    const result = await pool.query(query, [currentYear]);

    return result.rows.map(row => ({
      species_name: row.species_name,
      vessel_name: row.vessel_name,
      registration_number: row.registration_number,
      total_catch_kg: parseFloat(row.total_catch_kg),
      quota_kg: parseFloat(row.total_quota_kg),
      exceeded_by_kg: parseFloat(row.exceeded_by_kg),
      exceeded_percentage: parseFloat(row.exceeded_percentage)
    }));
  }

  async getTopVesselsBySpecies(speciesId: string, year?: number, limit: number = 10): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();

    const query = `
      SELECT 
        v.id,
        v.vessel_name,
        v.registration_number,
        SUM(cl.weight_kg) as total_catch_kg,
        COUNT(*) as catch_count
      FROM catch_logs cl
      JOIN vessels v ON cl.vessel_id = v.id
      WHERE cl.species_id = $1
        AND EXTRACT(YEAR FROM cl.catch_date) = $2
      GROUP BY v.id, v.vessel_name, v.registration_number
      ORDER BY total_catch_kg DESC
      LIMIT $3
    `;

    const result = await pool.query(query, [speciesId, currentYear, limit]);

    return result.rows.map(row => ({
      vessel_id: row.id,
      vessel_name: row.vessel_name,
      registration_number: row.registration_number,
      total_catch_kg: parseFloat(row.total_catch_kg),
      catch_count: parseInt(row.catch_count)
    }));
  }

  async getSeasonalCatchPattern(year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();

    const query = `
      SELECT 
        EXTRACT(MONTH FROM catch_date) as month,
        TO_CHAR(catch_date, 'Month') as month_name,
        s.common_name as species_name,
        SUM(weight_kg) as total_kg,
        COUNT(*) as catch_count
      FROM catch_logs cl
      JOIN species s ON cl.species_id = s.id
      WHERE EXTRACT(YEAR FROM catch_date) = $1
      GROUP BY EXTRACT(MONTH FROM catch_date), TO_CHAR(catch_date, 'Month'), s.common_name
      ORDER BY month ASC, total_kg DESC
    `;

    const result = await pool.query(query, [currentYear]);

    return result.rows.map(row => ({
      month: parseInt(row.month),
      month_name: row.month_name.trim(),
      species_name: row.species_name,
      total_kg: parseFloat(row.total_kg),
      catch_count: parseInt(row.catch_count)
    }));
  }

  /**
 * Returns quota usage by species for a given year
 */
  async getQuotaUsage(year: number) {
    const query = `
   WITH catch_totals AS (
  SELECT
    species_id,
    SUM(weight_kg) AS total_catch_kg
  FROM catch_logs
  WHERE EXTRACT(YEAR FROM catch_date) = $1
  GROUP BY species_id
)
SELECT
  s.id AS species_id,
  s.common_name AS species_name,
  COALESCE(ct.total_catch_kg, 0) AS total_catch_kg,
  q.total_quota_kg AS quota_kg,
  (
    COALESCE(ct.total_catch_kg, 0)::numeric
    / NULLIF(q.total_quota_kg, 0)::numeric
    * 100
  ) AS percentage_used,
  CASE
    WHEN COALESCE(ct.total_catch_kg, 0) > q.total_quota_kg THEN 'exceeded'
    WHEN (
      COALESCE(ct.total_catch_kg, 0)::numeric
      / NULLIF(q.total_quota_kg, 0)::numeric
    ) >= 0.9 THEN 'critical'
    WHEN (
      COALESCE(ct.total_catch_kg, 0)::numeric
      / NULLIF(q.total_quota_kg, 0)::numeric
    ) >= 0.75 THEN 'warning'
    ELSE 'safe'
  END AS status
FROM quotas q
JOIN species s ON q.species_id = s.id
LEFT JOIN catch_totals ct ON ct.species_id = s.id
WHERE q.year = $1
  AND q.status = 'active'
  --AND q.vessel_id IS NULL
ORDER BY percentage_used DESC;

  `;

    const { rows } = await pool.query(query, [year]);
    console.log(rows);
    return {
      year,
      data: rows,
    };
  }

  // async getQuotaUsage(year: number) {
  // const query = `
  //   WITH catch_totals AS (
  //     SELECT
  //       species_id,
  //       SUM(weight_kg) AS total_catch_kg
  //     FROM catch_logs
  //     WHERE EXTRACT(YEAR FROM catch_date) = $1
  //     GROUP BY species_id
  //   )
  //   SELECT
  //     s.id AS species_id,
  //     s.common_name AS species_name,
  //     COALESCE(ct.total_catch_kg, 0) AS total_catch_kg,
  //     q.total_quota_kg AS quota_kg,
  //     (
  //       COALESCE(ct.total_catch_kg, 0)::numeric
  //       / NULLIF(q.total_quota_kg, 0)::numeric
  //       * 100
  //     ) AS percentage_used,
  //     CASE
  //       WHEN COALESCE(ct.total_catch_kg, 0) > q.total_quota_kg THEN 'exceeded'
  //       WHEN (
  //         COALESCE(ct.total_catch_kg, 0)::numeric
  //         / NULLIF(q.total_quota_kg, 0)::numeric
  //       ) >= 0.9 THEN 'critical'
  //       WHEN (
  //         COALESCE(ct.total_catch_kg, 0)::numeric
  //         / NULLIF(q.total_quota_kg, 0)::numeric
  //       ) >= 0.75 THEN 'warning'
  //       ELSE 'safe'
  //     END AS status
  //   FROM quotas q
  //   JOIN species s ON q.species_id = s.id
  //   LEFT JOIN catch_totals ct ON ct.species_id = s.id
  //   WHERE q.year = $1
  //     AND q.status = 'active'
  //     --AND q.vessel_id IS NULL
  //   ORDER BY percentage_used DESC
  // `;

  // const result = await pool.query(query, [year]);
  // return result.rows;
// }
}

export default new DashboardService();