const express = require('express');
const router = express.Router();
const customerLeadController = require('../../Controller/Customer/Customer');


router.post('/customer-lead', customerLeadController.createCustomerLead);

module.exports = router;