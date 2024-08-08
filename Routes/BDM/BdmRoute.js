const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const BDMController = require('../../Controller/BDM/BdmController');
const auth = require('../../middleware/check-auth');

router.get('/leads/bdm/:bdmId',auth, BDMController.getLeadsByBDMId);

router.get('/estimations', BDMController.getAllEstimations);

router.put('/leads/:leadId/bdm-remarks', auth, BDMController.updateBDMRemarks);


// router.patch('/estimations/:id/status', BDMController.updateEstimationStatus);
router.patch('/estimations/:id/status', upload.single('document'),auth, BDMController.updateEstimationStatus);


module.exports = router;


