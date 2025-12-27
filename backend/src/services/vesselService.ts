import { pool } from '../db/config';
import { Vessel, CreateVesselDTO, VesselStatus, CrewAssignment } from '../types';

export class VesselService {
  
  async createVessel(data: CreateVesselDTO): Promise<Vessel> {
    const query = `
      INSERT INTO vessels (
        registration_number, vessel_name, vessel_type, 
        length_meters, tonnage, home_port, owner_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.registration_number,
      data.vessel_name,
      data.vessel_type || null,
      data.length_meters || null,
      data.tonnage || null,
      data.home_port || null,
      data.owner_id || null,
      'active'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getVesselById(id: string): Promise<Vessel | null> {
    const query = 'SELECT * FROM vessels WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllVessels(filters?: {
    status?: VesselStatus;
    owner_id?: string;
  }): Promise<Vessel[]> {
    let query = 'SELECT * FROM vessels WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters?.owner_id) {
      query += ` AND owner_id = $${paramCount}`;
      values.push(filters.owner_id);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async updateVessel(id: string, updates: Partial<CreateVesselDTO & { status: VesselStatus }>): Promise<Vessel> {
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
      UPDATE vessels 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Vessel not found');
    }

    return result.rows[0];
  }

  async deleteVessel(id: string): Promise<boolean> {
    const query = 'DELETE FROM vessels WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async assignCrew(
    vesselId: string,
    userId: string,
    role: string,
    isCaptain: boolean = false,
    assignedDate?: Date
  ): Promise<CrewAssignment> {
    const query = `
      INSERT INTO crew_assignments (
        vessel_id, user_id, role, is_captain, assigned_date, status
      ) VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;

    const values = [
      vesselId,
      userId,
      role,
      isCaptain,
      assignedDate || new Date()
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async removeCrew(vesselId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE crew_assignments 
      SET status = 'inactive', end_date = CURRENT_DATE
      WHERE vessel_id = $1 AND user_id = $2 AND status = 'active'
    `;

    const result = await pool.query(query, [vesselId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getVesselCrew(vesselId: string): Promise<any[]> {
    const query = `
      SELECT 
        ca.*,
        u.first_name,
        u.last_name,
        u.email,
        u.role as user_role
      FROM crew_assignments ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.vessel_id = $1 AND ca.status = 'active'
      ORDER BY ca.is_captain DESC, ca.assigned_date ASC
    `;

    const result = await pool.query(query, [vesselId]);
    return result.rows;
  }

  async getVesselWithDetails(id: string): Promise<any> {
    const vessel = await this.getVesselById(id);
    if (!vessel) return null;

    const crew = await this.getVesselCrew(id);
    
    // Get owner details
    let owner = null;
    if (vessel.owner_id) {
      const ownerQuery = 'SELECT id, first_name, last_name, email FROM users WHERE id = $1';
      const ownerResult = await pool.query(ownerQuery, [vessel.owner_id]);
      owner = ownerResult.rows[0] || null;
    }

    // Get catch statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_catches,
        SUM(weight_kg) as total_weight_kg,
        MAX(catch_date) as last_catch_date
      FROM catch_logs
      WHERE vessel_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [id]);
    const stats = statsResult.rows[0];

    return {
      ...vessel,
      owner,
      crew,
      statistics: {
        total_catches: parseInt(stats.total_catches) || 0,
        total_weight_kg: parseFloat(stats.total_weight_kg) || 0,
        last_catch_date: stats.last_catch_date
      }
    };
  }

  async getVesselsByStatus(status: VesselStatus): Promise<Vessel[]> {
    const query = 'SELECT * FROM vessels WHERE status = $1 ORDER BY vessel_name ASC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  async searchVessels(searchTerm: string): Promise<Vessel[]> {
    const query = `
      SELECT * FROM vessels 
      WHERE 
        vessel_name ILIKE $1 OR 
        registration_number ILIKE $1 OR
        home_port ILIKE $1
      ORDER BY vessel_name ASC
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

export default new VesselService();