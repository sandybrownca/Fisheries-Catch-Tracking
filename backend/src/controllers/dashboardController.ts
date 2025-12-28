import { Request, Response } from 'express';
import dashboardService from '../services/dashboardService';

export class DashboardController {

  async getDashboardStats(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;

      const stats = await dashboardService.getDashboardStats(yearNum);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCatchVsQuota(req: Request, res: Response) {
    try {
      const { year, vessel_id } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;

      const data = await dashboardService.getCatchVsQuotaData(
        yearNum,
        vessel_id as string
      );

      res.json({
        success: true,
        data,
        count: data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSpeciesTrend(req: Request, res: Response) {
    try {
      const { species_id } = req.params;
      const { start_date, end_date, vessel_id } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: 'start_date and end_date are required'
        });
      }

      const data = await dashboardService.getSpeciesTrendData(
        species_id,
        start_date as string,
        end_date as string,
        vessel_id as string
      );

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getOverfishingAlerts(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;

      const alerts = await dashboardService.getOverfishingAlerts(yearNum);

      res.json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getTopVesselsBySpecies(req: Request, res: Response) {
    try {
      const { species_id } = req.params;
      const { year, limit = '10' } = req.query;

      const yearNum = year ? parseInt(year as string) : undefined;
      const limitNum = parseInt(limit as string);

      const vessels = await dashboardService.getTopVesselsBySpecies(
        species_id,
        yearNum,
        limitNum
      );

      res.json({
        success: true,
        data: vessels,
        count: vessels.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSeasonalCatchPattern(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;

      const pattern = await dashboardService.getSeasonalCatchPattern(yearNum);

      res.json({
        success: true,
        data: pattern,
        count: pattern.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getQuotaUsage(req: Request, res: Response) {
    const year = Number(req.query.year);

    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    const result = await dashboardService.getQuotaUsage(year);
    res.json(result);
  }
}

export default new DashboardController();