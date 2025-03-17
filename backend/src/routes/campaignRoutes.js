const express = require('express');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Single email routes - place these BEFORE the :id routes to prevent param conflicts
router.post('/send-single', campaignController.sendSingleEmail);
router.get('/single-emails', campaignController.getSingleEmails);
router.delete('/single-emails/:id', campaignController.deleteSingleEmail);

// Campaign routes
router
  .route('/')
  .get(campaignController.getCampaigns)
  .post(campaignController.createCampaign);

router
  .route('/:id')
  .get(campaignController.getCampaign)
  .patch(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

router.post('/:id/send', campaignController.sendCampaign);

module.exports = router;