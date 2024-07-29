const express = require('express');
const router = express.Router();
const auth = require('../../middleware/check-auth');
const AgentController = require('../../Controller/Agent/AgentController');


router.post('/create/leads',auth, AgentController.createLead);
router.get('/lead/:mobileNo', AgentController.getLeadByMobileNo);
router.put('/leads/:leadId/assign-bdm',auth, AgentController.assignLeadToBDM);
router.get('/leads/agent/:agentId',auth, AgentController.getLeadsByAgentId);


module.exports = router;


