// const express = require('express');
// const router = express.Router();
// const lead_Meeting = require('../../Controller/Actions/lead_meeting');
// const Lead_Update = require('../../Controller/Actions/lead_update')

// router.post('/create/meeting', lead_Meeting.createMeeting);

// router.post('/update/lead' ,Lead_Update.createLeadUpdate )
 


// module.exports = router;



const express = require('express');
const router = express.Router();
const lead_Meeting = require('../../Controller/Actions/lead_meeting');
const Lead_Update = require('../../Controller/Actions/lead_update');
const auth = require('../../middleware/check-auth');
const multer = require('multer');


const upload = multer({ dest: 'uploads/' });

router.post('/create/meeting', upload.array('images'),auth, lead_Meeting.createMeeting);
router.post('/update/lead',auth, Lead_Update.createLeadUpdate);
router.get('/leads/:leadId/meetings',auth, lead_Meeting.getMeetingsByLeadId);

module.exports = router;




