 


const express = require('express');
const router = express.Router();
const site_visit = require('../../Controller/Actions/site_visit');
const auth = require('../../middleware/check-auth');
 
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/create/sitevisit', upload.array('images'), auth,site_visit.createSiteMeeting);
router.get('/leads/:leadId/site-visit', auth, site_visit.getSiteVisitByLeadId);

module.exports = router;




