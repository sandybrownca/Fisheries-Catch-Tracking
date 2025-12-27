
// ==========================================
// src/controllers/violationController.ts
import { violationService } from '../services/violationService';
import { Request,Response } from 'express';
export class ViolationController {
  async getViolations(req: Request, res: Response) {
    try {
      const { vessel_id, resolved, severity, start_date, end_date } = req.query;
      const violations = await violationService.getViolations({
        vessel_id: vessel_id as string,
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        severity: severity as string,
        start_date: start_date as string,
        end_date: end_date as string
      });
      res.json({ success: true, data: violations, count: violations.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resolveViolation(req: Request, res: Response) {
    try {
      const { resolved_by, notes } = req.body;
      if (!resolved_by) {
        return res.status(400).json({ success: false, error: 'resolved_by is required' });
      }
      const violation = await violationService.resolveViolation(
        req.params.id,
        resolved_by,
        notes
      );
      res.json({ success: true, data: violation, message: 'Violation resolved successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new ViolationController();