const express = require('express');
const router = express.Router();
const AgentController = require('../../Controller/Agent/AgentController');
const SupervisorController = require('../../Controller/SuperViser/super_viser');
const auth = require('../../middleware/check-auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Updated route for retrieving all leads with site visits for supervisor
router.get('/supervisor/leads-with-site-visits',auth, SupervisorController.getLeadsWithSiteVisitsForSupervisor);
router.get('/call-on-discussion', auth, SupervisorController.getLeadUpdatesByBDMForSupervisor);
router.get('/bdm/lead-meetings',auth, SupervisorController.getLeadMeetingsForSupervisor);
router.get('/bdm/estimation',auth, SupervisorController.getLeadEstimationsForSupervisor);
router.post('/upload-leads', upload.single('file'),auth, SupervisorController.uploadLeads);
router.get('/get/leads',auth, SupervisorController.getLeads);

module.exports = router;