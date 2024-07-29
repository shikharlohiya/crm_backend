const express = require('express');
const router = express.Router();
const estimationController = require('../../Controller/Actions/estimations');
const auth = require('../../middleware/check-auth');

router.post('/create/estimations',auth, estimationController.createEstimation);
router.get('/leads/:leadId/estimation', auth,estimationController.getEstimationByLeadId);

module.exports = router;