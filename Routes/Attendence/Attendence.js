
const express = require('express');
const router = express.Router();
const bdmActionController = require('../../Controller/Attendence/AttendenceController');

router.post('/batch-lead-actions',bdmActionController.handleBatchLeadActions);

module.exports = router;