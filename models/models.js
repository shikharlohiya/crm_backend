 
const Country = require('./country');
const State = require('./state');
const City = require('./city');
const Place = require('./place');
const Zone = require('./zone');
const Region = require('./region');
const Area = require('./area');
const Employee = require('./employee');
const Employee_Role = require('./employeRole');
const Lead_Detail = require('./lead_detail');
const lead_Meeting = require('./lead_meeting.js')
const Campaign = require('./campaign.js');
const Employee_Campaign = require('./EmployeCampaign.js');
const Lead_Update = require('./lead_update.js');
 const Site_Visit = require('./site_visit.js');
const Estimation = require('./estimation.js');
const AuditLeadDetail = require('./AuditLeadTable.js');
const AuditLeadRemark = require('./AuditLeadRemark.js');



// Uncomment and adjust the sync options as needed

// User.sync({force: true});
// Country.sync({force:true});
// State.sync({force:true});
// City.sync({alter:true});
// Place.sync({force:true});
// Zone.sync({force:true});
// Region.sync({force:true});
// Area.sync({force:true});
// Site_Visit.sync({force:true})
// BDM.sync({force:true})
// Employee.sync({alter: true});
// Employee_Role.sync({alter: true});
// Estimation.sync({alter: true});

// Estimation.sync({alter: true});

 

// lead_Meeting.sync({alter:true});
  //  AuditLeadRemark.sync({force:true});
  // Employee_Campaign.sync({force:true});
  // Lead_Detail.sync({alter: true})

  // Lead_Update.sync({alter: true})

 
// Call associate method for each model
// Object.keys(models).forEach(modelName => {
//     if (models[modelName].associate) {
//       models[modelName].associate(models);
//     }
//   });

module.exports = {
  Lead_Update,
  Site_Visit,
    lead_Meeting,
    Employee,
    Employee_Role,
    Country,
    State,
    City,
    Place,
    Zone,
    Region,
    Area,
    Lead_Detail,
    Campaign,
    AuditLeadDetail

  };