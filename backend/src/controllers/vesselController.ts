import { Request, Response } from 'express';
import vesselService from '../services/vesselService';
import { CreateVesselDTO, VesselStatus } from '../types';
export class VesselController {
  
  async createVessel(req: Request, res: Response) {
    try {
      const data: CreateVesselDTO = req.body;
      const vessel = await vesselService.createVessel(data);
      res.status(201).json({
        success: true,
        data: vessel
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getVesselById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vessel = await vesselService.getVesselWithDetails(id);
      
      if (!vessel) {
        return res.status(404).json({
          success: false,
          error: 'Vessel not found'
        });
      }

      res.json({
        success: true,
        data: vessel
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllVessels(req: Request, res: Response) {
    try {
      const { status, owner_id, search } = req.query;
      
      let vessels;
      if (search) {
        vessels = await vesselService.searchVessels(search as string);
      } else {
        vessels = await vesselService.getAllVessels({
          status: status as VesselStatus,
          owner_id: owner_id as string
        });
      }

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

  async updateVessel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const vessel = await vesselService.updateVessel(id, updates);
      
      res.json({
        success: true,
        data: vessel
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteVessel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await vesselService.deleteVessel(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Vessel not found'
        });
      }

      res.json({
        success: true,
        message: 'Vessel deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async assignCrew(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user_id, role, is_captain, assigned_date } = req.body;
      
      const assignment = await vesselService.assignCrew(
        id,
        user_id,
        role,
        is_captain,
        assigned_date ? new Date(assigned_date) : undefined
      );

      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async removeCrew(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      
      const removed = await vesselService.removeCrew(id, user_id);
      
      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Crew assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Crew member removed successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getVesselCrew(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const crew = await vesselService.getVesselCrew(id);

      res.json({
        success: true,
        data: crew,
        count: crew.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new VesselController();