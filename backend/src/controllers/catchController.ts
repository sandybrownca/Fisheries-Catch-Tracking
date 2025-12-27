import { Request, Response } from 'express';
import catchService from '../services/catchService';
import { CreateCatchLogDTO } from '../types';

export class CatchController {
  
  async createCatchLog(req: Request, res: Response) {
    try {
      const data: CreateCatchLogDTO = req.body;
      
      // Validate coordinates
      if (data.latitude < -90 || data.latitude > 90) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude value'
        });
      }
      
      if (data.longitude < -180 || data.longitude > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid longitude value'
        });
      }

      const catchLog = await catchService.createCatchLog(data);
      
      res.status(201).json({
        success: true,
        data: catchLog,
        message: 'Catch log created successfully. Violations checked automatically.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCatchLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const catchLog = await catchService.getCatchLogById(id);
      
      if (!catchLog) {
        return res.status(404).json({
          success: false,
          error: 'Catch log not found'
        });
      }

      res.json({
        success: true,
        data: catchLog
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCatchLogs(req: Request, res: Response) {
    try {
      const {
        vessel_id,
        species_id,
        start_date,
        end_date,
        is_verified,
        page = '1',
        limit = '50'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const { data, total } = await catchService.getCatchLogs({
        vessel_id: vessel_id as string,
        species_id: species_id as string,
        start_date: start_date as string,
        end_date: end_date as string,
        is_verified: is_verified === 'true' ? true : is_verified === 'false' ? false : undefined,
        limit: limitNum,
        offset
      });

      res.json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async verifyCatchLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { verified_by } = req.body;

      if (!verified_by) {
        return res.status(400).json({
          success: false,
          error: 'verified_by is required'
        });
      }

      const catchLog = await catchService.verifyCatchLog(id, verified_by);

      res.json({
        success: true,
        data: catchLog,
        message: 'Catch log verified successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCatchLogsByVessel(req: Request, res: Response) {
    try {
      const { vessel_id } = req.params;
      const { limit = '50' } = req.query;

      const catches = await catchService.getCatchLogsByVessel(
        vessel_id,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: catches,
        count: catches.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCatchLocationData(req: Request, res: Response) {
    try {
      const { start_date, end_date, species_id } = req.query;

      const locations = await catchService.getCatchLocationData({
        start_date: start_date as string,
        end_date: end_date as string,
        species_id: species_id as string
      });

      res.json({
        success: true,
        data: locations,
        count: locations.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getTotalCatchBySpecies(req: Request, res: Response) {
    try {
      const { species_id } = req.params;
      const { year, vessel_id } = req.query;

      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

      const total = await catchService.getTotalCatchBySpecies(
        species_id,
        currentYear,
        vessel_id as string
      );

      res.json({
        success: true,
        data: {
          species_id,
          year: currentYear,
          vessel_id: vessel_id || null,
          total_catch_kg: total
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CatchController();