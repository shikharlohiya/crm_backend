
const Lead_Detail = require('../../models/lead_detail');
const Employee = require('../../models/employee');
const LeadUpdate = require('../../models/lead_update');
const Campaign = require('../../models/campaign');
const site_visit = require('../../models/site_visit');
const lead_Meeting = require('../../models/lead_meeting');
const estimation = require('../../models/estimation');
const AuditLeadDetail = require('../../models/AuditLeadTable')
const { Op } = require('sequelize');
const sequelize = require('../../models/index');
const XLSX = require('xlsx');
const multer = require('multer');
const AuditLeadRemark = require('../../models/AuditLeadRemark')
 



 
 
 
//29-07-2024
// function excelDateToJSDate(excelDate) {
//   if (typeof excelDate === 'string' && excelDate.includes('-')) {
//     return excelDate; // Already in the correct format
//   }
//   const date = new Date((excelDate - 25569) * 86400 * 1000);
//   return date.toISOString().split('T')[0].split('-').reverse().join('-');
// }
//29-07-2024

// exports.uploadAuditLeads = async (req, res) => {
//   try {
//     const file = req.file;
//     const workbook = XLSX.readFile(file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     const existingLotNumbers = new Set();
//     const updatedRecords = [];
//     const newRecords = [];
//     const invalidRecords = [];

//     for (const row of data) {
//       const lotNumber = row['Lot Number'];

//       if (!lotNumber) {
//         invalidRecords.push(row);
//         continue;
//       }

//       const existingLead = await AuditLeadDetail.findOne({ where: { Lot_Number: lotNumber } });

//       const formattedHatchDate = excelDateToJSDate(row['Hatch Date']);

//       const recordData = {
//         Zone_Name: row['Zone Name'],
//         Branch_Name: row['Branch Name'],
//         Vendor: row['Vendor'],
//         Shed_Type: row['Shed Type'],
//         Farmer_Name: row['Farmer Name'],
//         Placed_Qty: row['Placed Qty'],
//         Hatch_Date: formattedHatchDate,
//         CA: row['CA'],
//         Age_SAP: row['Age (SAP)'],
//         Diff: row['Diff'],
//         first_Week_M: row['1st Week M.'],
//         First_Week_Mortality_Percentage: row['1st Week M.%'],
//         Total_Mortality: row['Total M.'],
//         Total_Mortality_Percentage: row['Total M%'],
//         Lifting_EA: row['Lifting (EA)'],
//         Lift_Percentage: row['Lift%'],
//         Avg_Lift_Wt: row['Avg. Lift Wt.'],
//         Bal_Birds: row['Bal. Birds'],
//         ABWT: row['ABWT'],
//         BWT_Age: row['BWT Age'],
//         Feed_Cons: row['Feed Cons.'],
//         Prev_Grade: row['Prev Grade.'],
//         FCR: row['FCR'],
//         Mobile: row['Mobile'],
//         Line: row['Line'],
//         Hatchery_Name: row['Hatchery Name']
//       };

//       if (existingLead) {
//         await existingLead.update(recordData);
//         updatedRecords.push(lotNumber);
//       } else {
//         newRecords.push({
//           ...recordData,
//           Lot_Number: lotNumber
//         });
//       }

//       existingLotNumbers.add(lotNumber);
//     }

//     if (newRecords.length > 0) {
//       await AuditLeadDetail.bulkCreate(newRecords);
//     }

//     let message = '';
//     if (newRecords.length > 0) {
//       message = `${newRecords.length} new audit lead(s) uploaded successfully. `;
//     }
//     if (updatedRecords.length > 0) {
//       message += `${updatedRecords.length} existing audit lead(s) updated successfully. `;
//     }
//     if (invalidRecords.length > 0) {
//       message += `${invalidRecords.length} record(s) skipped due to missing or invalid Lot Number.`;
//     }

//     if (newRecords.length === 0 && updatedRecords.length === 0 && invalidRecords.length === 0) {
//       message = 'No new audit leads uploaded or updated.';
//     }

//     res.status(200).json({ 
//       message, 
//       newCount: newRecords.length, 
//       updatedCount: updatedRecords.length, 
//       skippedCount: invalidRecords.length 
//     });
//   } catch (error) {
//     console.error('Error uploading audit leads:', error);

//     if (error.name === 'SequelizeDatabaseError') {
//       if (error.parent && error.parent.code === 'ER_DATA_TOO_LONG') {
//         res.status(400).json({ message: 'Data exceeds the maximum length allowed for a field' });
//       } else if (error.parent && error.parent.code === 'ER_NO_DEFAULT_FOR_FIELD') {
//         res.status(400).json({ message: 'Missing required field value' });
//       } else {
//         res.status(500).json({ message: 'Database error occurred' });
//       }
//     } else if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map((err) => ({
//         field: err.path,
//         message: err.message,
//       }));
//       res.status(400).json({ message: 'Validation failed', errors });
//     } else if (error instanceof multer.MulterError) {
//       if (error.code === 'LIMIT_FILE_SIZE') {
//         res.status(400).json({ message: 'File size exceeds the limit' });
//       } else {
//         res.status(400).json({ message: 'File upload error occurred' });
//       }
//     } else {
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// };


function excelDateToJSDate(excelDate) {
    if (typeof excelDate === 'string' && excelDate.includes('-')) {
      return excelDate; // Already in the correct format
    }
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0].split('-').reverse().join('-');
  }
  
  exports.uploadAuditLeads = async (req, res) => {
    try {
      const file = req.file;
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
  
      const updatedRecords = [];
      const invalidRecords = [];
  
      for (const row of data) {
        const lotNumber = row['Lot Number'];
  
        if (!lotNumber) {
          invalidRecords.push(row);
          continue;
        }
  
        const formattedHatchDate = excelDateToJSDate(row['Hatch Date']);
  
        const recordData = {
          Zone_Name: row['Zone Name'],
          Branch_Name: row['Branch Name'],
          Vendor: row['Vendor'],
          Shed_Type: row['Shed Type'],
          Farmer_Name: row['Farmer Name'],
          Placed_Qty: row['Placed Qty'],
          Hatch_Date: formattedHatchDate,
          CA: row['CA'],
          Age_SAP: row['Age (SAP)'],
          Diff: row['Diff'],
          first_Week_M: row['1st Week M.'],
          First_Week_Mortality_Percentage: row['1st Week M.%'],
          Total_Mortality: row['Total M.'],
          Total_Mortality_Percentage: row['Total M%'],
          Lifting_EA: row['Lifting (EA)'],
          Lift_Percentage: row['Lift%'],
          Avg_Lift_Wt: row['Avg. Lift Wt.'],
          Bal_Birds: row['Bal. Birds'],
          ABWT: row['ABWT'],
          BWT_Age: row['BWT Age'],
          Feed_Cons: row['Feed Cons.'],
          Prev_Grade: row['Prev Grade.'],
          FCR: row['FCR'],
          Mobile: row['Mobile'],
          Line: row['Line'],
          Hatchery_Name: row['Hatchery Name'],
          Lot_Number: lotNumber
        };
  
        updatedRecords.push(recordData);
      }
  
      await sequelize.transaction(async (transaction) => {
        if (updatedRecords.length > 0) {
          await AuditLeadDetail.bulkCreate(updatedRecords, {
            updateOnDuplicate: Object.keys(updatedRecords[0]),
            transaction,
            logging: false
          });
        }
      });
  
      let message = '';
      if (updatedRecords.length > 0) {
        message = `${updatedRecords.length} audit lead(s) uploaded/updated successfully. `;
      }
      if (invalidRecords.length > 0) {
        message += `${invalidRecords.length} record(s) skipped due to missing or invalid Lot Number.`;
      }
  
      if (updatedRecords.length === 0 && invalidRecords.length === 0) {
        message = 'No audit leads uploaded or updated.';
      }
  
      res.status(200).json({
        message,
        uploadedCount: updatedRecords.length,
        skippedCount: invalidRecords.length
      });
    } catch (error) {
      console.error('Error uploading audit leads:', error);
  
      if (error.name === 'SequelizeDatabaseError') {
        if (error.parent && error.parent.code === 'ER_DATA_TOO_LONG') {
          res.status(400).json({ message: 'Data exceeds the maximum length allowed for a field' });
        } else if (error.parent && error.parent.code === 'ER_NO_DEFAULT_FOR_FIELD') {
          res.status(400).json({ message: 'Missing required field value' });
        } else {
          res.status(500).json({ message: 'Database error occurred' });
        }
      } else if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        res.status(400).json({ message: 'Validation failed', errors });
      } else if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ message: 'File size exceeds the limit' });
        } else {
          res.status(400).json({ message: 'File upload error occurred' });
        }
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };














//   exports.getAuditLeads = async (req, res) => {
//     try {
//       const auditLeads = await AuditLeadDetail.findAll({
//         order: [['updatedAt', 'DESC']],
//       });
  
//       res.status(200).json({ data: auditLeads });
//     } catch (error) {
//       console.error('Error retrieving audit leads:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };


exports.getAuditLeads = async (req, res) => {
    try {
      const { agentId } = req.query; // Assuming you'll pass the agent's ID as a query parameter
  
      if (!agentId) {
        return res.status(400).json({ message: 'Agent ID is required' });
      }
  
      // First, fetch the agent's details to get their mapped regions
      const agent = await Employee.findByPk(agentId, {
        attributes: ['EmployeeName', 'EmployeeRegion']
      });
  
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
  
      // Assuming MappedRegions is stored as a comma-separated string
      const mappedRegions = agent.EmployeeRegion.split(',').map(region => region.trim());
  
      // Fetch audit leads for the mapped regions
      const auditLeads = await AuditLeadDetail.findAll({
        where: {
          Zone_Name: {
            [Op.in]: mappedRegions
          }
        },
        order: [['updatedAt', 'DESC']],
      });
      const totalCount = auditLeads.length;
  
      res.status(200).json({ 
        data: auditLeads,
        agent: {
          name: agent.EmployeeName,
          mappedRegions: mappedRegions
        },
        totalCount: totalCount
      });
    } catch (error) {
      console.error('Error retrieving audit leads:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

   

exports.createAuditLeadRemark = async (req, res) => {
  try {
    const {
      CH,
      AGE,
      BWT,
      M_QTY,
      REASON,
      MED,
      FEED,
      STOCK,
      IFFT_IN,
      IFFT_OUT,
      LS_VISIT,
      BM_VISIT,
      DAILY_ENT,
      FEED_ENT,
      MORT_ENT,
      BWT_ENT,
      MED_ENT,
      REMARKS,
      DATE,
      Lot_Number,
      AgentId
    } = req.body;

    const auditLeadRemark = await AuditLeadRemark.create({
      CH,
      AGE,
      BWT,
      M_QTY,
      REASON,
      MED,
      FEED,
      STOCK,
      IFFT_IN,
      IFFT_OUT,
      LS_VISIT,
      BM_VISIT,
      DAILY_ENT,
      FEED_ENT,
      MORT_ENT,
      BWT_ENT,
      MED_ENT,
      REMARKS,
      DATE,
      Lot_Number,
      AgentId
    });

    // res.status(201).json(auditLeadRemark);

    res.status(200).json({ message: 'created audit lead remark successfully', auditLeadRemark });
  } catch (error) {
    console.error('Error creating audit lead remark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

 

exports.getAuditLeadRemarksByLotNumber = async (req, res) => {
  try {
    const { lotNumber } = req.params;

    const auditLeadRemarks = await AuditLeadRemark.findAll({
        order: [['updatedAt', 'DESC']],
      where: {
        Lot_Number: lotNumber,
      },
      include: [
        {
          model: Employee,
          as: 'Agent',
          attributes: ['EmployeeName'],
        },
      ],
    });

    if (auditLeadRemarks.length === 0) {
      return res.status(200).json({ message: 'No audit lead remarks found for the specified Lot Number' });
    }

    res.status(200).json({ auditLeadRemarks });
  } catch (error) {
    console.error('Error retrieving audit lead remarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// exports.getSupervisorDashboard = async (req, res) => {
//     try {
//       // Fetch all agents
//       const agents = await Employee.findAll({
//         attributes: [ 'EmployeeName', 'EmployeeRegion'],
//         where: {
//           EmployeeRoleId: 100
//         }
//       });
  
//       const dashboardData = await Promise.all(agents.map(async (agent) => {
//         const mappedRegions = agent.EmployeeRegion.split(',').map(region => region.trim());
  
//         // Fetch audit leads for the agent
//         const auditLeads = await AuditLeadDetail.findAll({
//           where: {
//             Zone_Name: {
//               [Op.in]: mappedRegions
//             }
//           },
//           include: [
//             {
//               model: AuditLeadRemark,
//               as: 'AuditRemarks',
//               include: [
//                 {
//                   model: Employee,
//                   as: 'Agent',
//                   attributes: ['EmployeeName']
//                 }
//               ]
//             }
//           ]
//         });
  
//         // Calculate counts
//         const openCount = auditLeads.filter(lead => lead.status === 'open').length;
//         const closedCount = auditLeads.filter(lead => lead.status === 'closed').length;
//         const workingCount = auditLeads.filter(lead => lead.status === 'working').length;
  
//         // Collect all remarks
//         const remarks = auditLeads.flatMap(lead => 
//           lead.AuditRemarks.map(remark => ({
//             lotNumber: lead.Lot_Number,
//             remark: remark.REMARKS,
//             date: remark.DATE,
//             agentName: remark.Agent.EmployeeName
//           }))
//         );
  
//         return {
//           agentId: agent.id,
//           agentName: agent.EmployeeName,
//           mappedRegions: mappedRegions,
//           totalLeads: auditLeads.length,
//           openCount,
//           closedCount,
//           workingCount,
//           remarks
//         };
//       }));
  
//       res.status(200).json({
//         success: true,
//         data: dashboardData
//       });
  
//     } catch (error) {
//       console.error('Error fetching supervisor dashboard:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };
exports.getSupervisorDashboard = async (req, res) => {
    try {
      // Fetch all agents
      const agents = await Employee.findAll({
        attributes: ['EmployeeName', 'EmployeeRegion'],
        where: {
          // Add any condition to filter employees who are agents
          // For example: Role: 'Agent'
          EmployeeRoleID : 100
        }
      });
  
      const dashboardData = await Promise.all(agents.map(async (agent) => {
        // Add null check for EmployeeRegion
        const mappedRegions = agent.EmployeeRegion 
          ? agent.EmployeeRegion.split(',').map(region => region.trim())
          : [];
  
        // Rest of the code remains the same
        const auditLeads = await AuditLeadDetail.findAll({
          where: {
            Zone_Name: {
              [Op.in]: mappedRegions
            }
          },
          include: [
            {
              model: AuditLeadRemark,
              as: 'AuditRemarks',
              include: [
                {
                  model: Employee,
                  as: 'Agent',
                  attributes: ['EmployeeName']
                }
              ]
            }
          ]
        });
  
        // Calculate counts
        const openCount = auditLeads.filter(lead => lead.status === 'open').length;
        const closedCount = auditLeads.filter(lead => lead.status === 'closed').length;
        const workingCount = auditLeads.filter(lead => lead.status === 'working').length;
  
        // Collect all remarks
        const remarks = auditLeads.flatMap(lead => 
          lead.AuditRemarks.map(remark => ({
            lotNumber: lead.Lot_Number,
            remark: remark.REMARKS,
            date: remark.DATE,
            agentName: remark.Agent.EmployeeName
          }))
        );
  
        return {
          agentId: agent.id,
          agentName: agent.EmployeeName,
          mappedRegions: mappedRegions,
          totalLeads: auditLeads.length,
          openCount,
          closedCount,
          workingCount,
          remarks
        };
      }));
  
      res.status(200).json({
        success: true,
        data: dashboardData
      });
  
    } catch (error) {
      console.error('Error fetching supervisor dashboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



  exports.updateAuditLeadStatus = async (req, res) => {
    try {
      const { lotNumber, newStatus } = req.body;
  
      if (!lotNumber || !newStatus) {
        return res.status(400).json({ message: 'Lot number and new status are required' });
      }
  
      if (!['open', 'working', 'closed'].includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status. Must be open, working, or closed' });
      }
  
      const auditLead = await AuditLeadDetail.findByPk(lotNumber);
  
      if (!auditLead) {
        return res.status(404).json({ message: 'Audit lead not found' });
      }
  
      auditLead.status = newStatus;
      await auditLead.save();
  
      res.status(200).json({
        success: true,
        message: 'Audit lead status updated successfully',
        data: auditLead
      });
  
    } catch (error) {
      console.error('Error updating audit lead status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  