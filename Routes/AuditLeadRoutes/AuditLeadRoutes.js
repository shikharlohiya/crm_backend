const express = require('express');
const router = express.Router();
const auth = require('../../middleware/check-auth');
const AuditController = require('../../Controller/auditController/auditLeadController');



const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/upload-audit-leads', upload.single('file'), auth, AuditController.uploadAuditLeads);
router.get('/audit-leads', auth, AuditController.getAuditLeads);
router.post('/audit-remarks' , auth, AuditController.createAuditLeadRemark)
router.get('/get-audit-remarks/:lotNumber' , auth, AuditController.getAuditLeadRemarksByLotNumber)
router.get('/supervisor-dashboard', AuditController.getSupervisorDashboard);
 
module.exports = router;
