const express = require('express');
const router = express.Router();
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const BDMController = require('../../Controller/BDM/BdmController');
const auth = require('../../middleware/check-auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMiddleware = upload.fields([
  { name: 'images', maxCount: 10 },
  // Add any other fields you need here
]);

 
  
  router.patch(
    '/estimations/:id/status',uploadMiddleware,BDMController.updateEstimationStatus
  );
  

 



router.get('/leads/bdm/:bdmId', BDMController.getLeadsByBDMId);

router.get('/estimations', BDMController.getAllEstimations);

router.put('/leads/:leadId/bdm-remarks', auth, BDMController.updateBDMRemarks);


// router.patch('/estimations/:id/status', BDMController.updateEstimationStatus);
// router.patch('/estimations/:id/status', upload.single('document'),auth, BDMController.updateEstimationStatus);


 

module.exports = router;


