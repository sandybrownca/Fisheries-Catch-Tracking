import { Router } from 'express';
import vesselController from '../controllers/vesselController';
import catchController from '../controllers/catchController';
import dashboardController from '../controllers/dashboardController';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// VESSEL ROUTES
// ============================================
router.post('/vessels', vesselController.createVessel);
router.get('/vessels', vesselController.getAllVessels);
router.get('/vessels/:id', vesselController.getVesselById);
router.put('/vessels/:id', vesselController.updateVessel);
router.delete('/vessels/:id', vesselController.deleteVessel);

// Crew management
router.post('/vessels/:id/crew', vesselController.assignCrew);
router.delete('/vessels/:id/crew', vesselController.removeCrew);
router.get('/vessels/:id/crew', vesselController.getVesselCrew);

// ============================================
// CATCH LOG ROUTES
// ============================================
router.post('/catches', catchController.createCatchLog);
router.get('/catches', catchController.getCatchLogs);
router.get('/catches/:id', catchController.getCatchLogById);
router.put('/catches/:id/verify', catchController.verifyCatchLog);

// Catch analytics
router.get('/catches/vessel/:vessel_id', catchController.getCatchLogsByVessel);
router.get('/catches/species/:species_id/total', catchController.getTotalCatchBySpecies);
router.get('/catches/locations', catchController.getCatchLocationData);

// ============================================
// SPECIES ROUTES
// ============================================
const speciesController = require('../controllers/speciesController').default;
router.post('/species', speciesController.createSpecies);
router.get('/species', speciesController.getAllSpecies);
router.get('/species/:id', speciesController.getSpeciesById);
router.get('/species/:id/stats', speciesController.getSpeciesWithStats);
router.put('/species/:id', speciesController.updateSpecies);
router.delete('/species/:id', speciesController.deleteSpecies);
router.get('/species/top/by-catch', speciesController.getTopSpeciesByCatch);

// ============================================
// QUOTA ROUTES
// ============================================
const quotaController = require('../controllers/quotaController').default;
router.post('/quotas', quotaController.createQuota);
router.get('/quotas', quotaController.getQuotas);
router.put('/quotas/:id', quotaController.updateQuota);
router.get('/quotas/check/:species_id', quotaController.checkQuotaExceeded);

// ============================================
// SEASONAL RESTRICTION ROUTES
// ============================================
router.post('/restrictions', quotaController.createSeasonalRestriction);
router.get('/restrictions', quotaController.getSeasonalRestrictions);

// ============================================
// VIOLATION ROUTES
// ============================================
const violationController = require('../controllers/violationController').default;
router.get('/violations', violationController.getViolations);
router.put('/violations/:id/resolve', violationController.resolveViolation);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/catch-vs-quota', dashboardController.getCatchVsQuota);
router.get('/dashboard/species/:species_id/trend', dashboardController.getSpeciesTrend);
router.get('/dashboard/overfishing-alerts', dashboardController.getOverfishingAlerts);
router.get('/dashboard/species/:species_id/top-vessels', dashboardController.getTopVesselsBySpecies);
router.get('/dashboard/seasonal-pattern', dashboardController.getSeasonalCatchPattern);

export default router;