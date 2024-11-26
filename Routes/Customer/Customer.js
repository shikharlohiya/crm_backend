const express = require('express');
const router = express.Router();
const customerLeadController = require('../../Controller/Customer/Customer');


router.post('/customer-lead', customerLeadController.createCustomerLead);
router.post('/vistaar-lead',customerLeadController.createVistaarBroilerDistribution);
router.post('/chicks-inquiry',customerLeadController.createChicksInquiry)

module.exports = router;