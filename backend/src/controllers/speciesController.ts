// src/controllers/speciesController.ts
import { Request, Response } from 'express';
import speciesService from '../services/speciesService';

export class SpeciesController {
  async createSpecies(req: Request, res: Response) {
    try {
      const species = await speciesService.createSpecies(req.body);
      res.status(201).json({ success: true, data: species });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getSpeciesById(req: Request, res: Response) {
    try {
      const species = await speciesService.getSpeciesById(req.params.id);
      if (!species) {
        return res.status(404).json({ success: false, error: 'Species not found' });
      }
      res.json({ success: true, data: species });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllSpecies(req: Request, res: Response) {
    try {
      const { conservation_status, search } = req.query;
      const species = await speciesService.getAllSpecies({
        conservation_status: conservation_status as string,
        search: search as string
      });
      res.json({ success: true, data: species, count: species.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateSpecies(req: Request, res: Response) {
    try {
      const species = await speciesService.updateSpecies(req.params.id, req.body);
      res.json({ success: true, data: species });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteSpecies(req: Request, res: Response) {
    try {
      await speciesService.deleteSpecies(req.params.id);
      res.json({ success: true, message: 'Species deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getSpeciesWithStats(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;
      const species = await speciesService.getSpeciesWithStats(req.params.id, yearNum);
      if (!species) {
        return res.status(404).json({ success: false, error: 'Species not found' });
      }
      res.json({ success: true, data: species });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTopSpeciesByCatch(req: Request, res: Response) {
    try {
      const { year, limit = '10' } = req.query;
      const yearNum = year ? parseInt(year as string) : undefined;
      const species = await speciesService.getTopSpeciesByCatch(yearNum, parseInt(limit as string));
      res.json({ success: true, data: species, count: species.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new SpeciesController();