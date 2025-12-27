// ==========================================
// src/controllers/quotaController.ts
import { quotaService } from '../services/violationService';
import { CreateQuotaDTO } from '../types'; 
import { Request,Response } from 'express';
export class QuotaController {
  async createQuota(req: Request, res: Response) {
    try {
      const quota = await quotaService.createQuota(req.body as CreateQuotaDTO);
      res.status(201).json({ success: true, data: quota });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getQuotas(req: Request, res: Response) {
    try {
      const { species_id, year, vessel_id, status } = req.query;
      const quotas = await quotaService.getQuotas({
        species_id: species_id as string,
        year: year ? parseInt(year as string) : undefined,
        vessel_id: vessel_id as string,
        status: status as string
      });
      res.json({ success: true, data: quotas, count: quotas.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateQuota(req: Request, res: Response) {
    try {
      const quota = await quotaService.updateQuota(req.params.id, req.body);
      res.json({ success: true, data: quota });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async checkQuotaExceeded(req: Request, res: Response) {
    try {
      const { species_id } = req.params;
      const { year, vessel_id } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      const result = await quotaService.checkQuotaExceeded(
        species_id,
        currentYear,
        vessel_id as string
      );
      
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createSeasonalRestriction(req: Request, res: Response) {
    try {
      const restriction = await quotaService.createSeasonalRestriction(req.body);
      res.status(201).json({ success: true, data: restriction });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getSeasonalRestrictions(req: Request, res: Response) {
    try {
      const { species_id, year, active_on_date } = req.query;
      const restrictions = await quotaService.getSeasonalRestrictions({
        species_id: species_id as string,
        year: year ? parseInt(year as string) : undefined,
        active_on_date: active_on_date as string
      });
      res.json({ success: true, data: restrictions, count: restrictions.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new QuotaController();
