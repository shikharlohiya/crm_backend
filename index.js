const express = require('express')
var bodyParser = require('body-parser')
const app = express()
// require('./models/index.js')
const models = require('./models/models.js');
const PincodeRoutes = require('./Routes/Pincode.js');
const authRoutes = require('./Routes/authRoutes.js');
const AgentRoutes = require('./Routes/Agent/AgentRoute.js');
const BDMRoutes = require('./Routes/BDM/BdmRoute.js');
const ActionRoutes = require('./Routes/Actions/lead_meeting.js')
const LeadUpdate = require('./Routes/Actions/lead_update.js');
const ActionSiteVisit = require('./Routes/Actions/site_visit.js');
const Estimation = require('./Routes/Actions/estimation.js');
const Confirmation = require('./Routes/Actions/confirmation.js');
const SuperViser = require('./Routes/SuperViser/super_viser.js');
const Audit = require('./Routes/AuditLeadRoutes/AuditLeadRoutes.js')
const exotelRoutes = require('./Routes/exotel.js');
const Region = require('./Routes/Region/RegionRoute.js');
const Incoming = require('./Controller/CallingAPI/incoming.js');
const EndCall = require('./Controller/CallingAPI/CallEndApi.js');
 

const cors = require('cors');
 

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api/auth' ,authRoutes)
app.use('/api', exotelRoutes);
app.use('/api',AgentRoutes);
app.use('/api',BDMRoutes );
app.use('/api' ,ActionRoutes);
app.use('/api', LeadUpdate);
app.use('/api', ActionSiteVisit);
app.use('/api' ,Estimation);
app.use('/api' , Confirmation);
app.use('/api', SuperViser);
app.use('/api', Audit);
app.use('/api',Region);
app.use('/api',Incoming);
app.use('/api' ,EndCall );
 





app.get('/', function (req, res) {
  res.send('Parivartan API')
})

app.use('/api', PincodeRoutes);
 

app.listen(3002 , ()=>{
    console.log('App will run on : http://0.0.0.0:3002')
})

