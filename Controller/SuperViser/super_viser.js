 






// Controller/Supervisor/SupervisorController.js

const Lead_Detail = require('../../models/lead_detail');
const Employee = require('../../models/employee');
const LeadUpdate = require('../../models/lead_update');
const Campaign = require('../../models/campaign');
const site_visit = require('../../models/site_visit');
const lead_Meeting = require('../../models/lead_meeting');
const estimation = require('../../models/estimation');
const { Op } = require('sequelize');
const sequelize = require('../../models/index');
const XLSX = require('xlsx');


// exports.getLeadsWithSiteVisitsForSupervisor = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, date } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = {};
//     if (date) {
//       whereClause.createdAt = {
//         [Op.gte]: new Date(date),
//         [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//       };
//     }

//     const { count, rows: leads } = await Lead_Detail.findAndCountAll({
//       include: [
//         { model: Employee, as: 'Agent' },
//         { model: Employee, as: 'BDM' },
//         { model: Employee, as: 'Superviser' },
//         {
//           model: Campaign,
//           as: 'Campaign',
//           attributes: ['CampaignId', 'CampaignName'],
//         },
//         {
//           model: site_visit,
//           as: 'site_visits',
//           where: whereClause,
//         },
//       ],
//       offset,
//       limit: parseInt(limit),
//     });

//     const leadsWithSiteVisits = leads.map((lead) => ({
//       ...lead.toJSON(),
//       site_visit_count: lead.site_visits.length,
//       site_visits: lead.site_visits.map((visit) => ({
//         ...visit.toJSON(),
//         lead_id: lead.id,
//       })),
//     }));

//     const totalSiteVisits = await site_visit.count({ where: whereClause });

//     res.status(200).json({
//       leads: leadsWithSiteVisits,
//       pagination: {
//         total: count,
//         page: parseInt(page),
//         limit: parseInt(limit),
//       },
//       total_site_visits: totalSiteVisits,
//     });
//   } catch (error) {
//     console.error('Error retrieving leads with site visits for supervisor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

exports.getLeadsWithSiteVisitsForSupervisor = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lt]: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const { count, rows: leads } = await Lead_Detail.findAndCountAll({
      include: [
        { model: Employee, as: 'Agent' },
        { model: Employee, as: 'BDM' },
        { model: Employee, as: 'Superviser' },
        {
          model: Campaign,
          as: 'Campaign',
          attributes: ['CampaignId', 'CampaignName'],
        },
        {
          model: site_visit,
          as: 'site_visits',
          where: whereClause,
        },
      ],
      offset,
      limit: parseInt(limit),
    });   

    const leadsWithSiteVisits = leads.map((lead) => ({
      ...lead.toJSON(),
      site_visit_count: lead.site_visits.length,
      site_visits: lead.site_visits.map((visit) => ({
        ...visit.toJSON(),
        lead_id: lead.id,
      })),
    }));

    const totalSiteVisits = await site_visit.count({ where: whereClause });

    res.status(200).json({
      leads: leadsWithSiteVisits,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },  
      total_site_visits: totalSiteVisits,
    });
  } catch (error) {
    console.error('Error retrieving leads with site visits for supervisor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


 
 
 
 

// exports.getLeadUpdatesByBDMForSupervisor = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, date } = req.query;
//     const offset = (page - 1) * limit;
     

//     const whereClause = {
//       BDMId: { [Op.ne]: null },
//     };
//     if (date) {
//       whereClause.createdAt = {
//         [Op.gte]: new Date(date),
//         [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//       };
//     }

//     const { count, rows: leadUpdates } = await LeadUpdate.findAndCountAll({
//       include: [
//         {
//           model: Lead_Detail,
//           as: 'LeadDetail',
//           include: [
//             { model: Employee, as: 'Agent' },
//             { model: Employee, as: 'BDM' },
//             { model: Employee, as: 'Superviser' },
//           ],
//         },
//         { model: Employee, as: 'BDM' },
//       ],
//       where: whereClause,
//       offset,
//       limit: parseInt(limit),
//     });

//     const formattedLeadUpdates = leadUpdates.map((leadUpdate) => ({
//       ...leadUpdate.toJSON(),
//       LeadDetail: {
//         ...leadUpdate.LeadDetail.toJSON(),
//         Agent: leadUpdate.LeadDetail.Agent,
//         BDM: leadUpdate.LeadDetail.BDM,
//         Superviser: leadUpdate.LeadDetail.Superviser,
//       },
//       BDM: leadUpdate.BDM,
//     }));

//     const bdmLeadUpdateCounts = await LeadUpdate.findAll({
//       attributes: [
//         'BDMId',
//         [sequelize.fn('COUNT', sequelize.col('BDMId')), 'leadUpdateCount'],
//       ],
//       where: whereClause,
//       group: ['BDMId'],
//       include: [{ model: Employee, as: 'BDM', attributes: ['EmployeeName'] }],
//     });

//     res.status(200).json({
//       leadUpdates: formattedLeadUpdates,
//       pagination: {
//         total: count,
//         page: parseInt(page),
//         limit: parseInt(limit),
//       },
//       bdmLeadUpdateCounts,
//     });
//   } catch (error) {
//     console.error('Error retrieving lead updates by BDM for supervisor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };






// exports.getLeadUpdatesByBDMForSupervisor = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, date } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = {
//       BDMId: { [Op.ne]: null },
//     };
//     if (date) {
//       whereClause.createdAt = {
//         [Op.gte]: new Date(date),
//         [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//       };
//     }

//     const { count, rows: leadUpdates } = await LeadUpdate.findAndCountAll({
//       include: [
//         {
//           model: Lead_Detail,
//           as: 'LeadDetail',
//           include: [
//             { model: Employee, as: 'Agent' },
//             { model: Employee, as: 'BDM' },
//             { model: Employee, as: 'Superviser' },
//           ],
//         },
//         { model: Employee, as: 'BDM' },
//       ],
//       where: whereClause,
//       offset,
//       limit: parseInt(limit),
//     });

//     const formattedLeadUpdates = leadUpdates.map((leadUpdate) => ({
//       ...leadUpdate.toJSON(),
//       callOnDiscussion: {
//         id: leadUpdate.id,
//         follow_up_date: leadUpdate.follow_up_date,
//         category: leadUpdate.category,
//         sub_category: leadUpdate.sub_category,
//         remark: leadUpdate.remark,
//         closure_month: leadUpdate.closure_month,
//         BDMId: leadUpdate.BDMId,
//         createdAt: leadUpdate.createdAt,
//         updatedAt: leadUpdate.updatedAt,
//         LeadDetailId: leadUpdate.LeadDetailId,
//         AgentId: leadUpdate.AgentId,
//       },
//       LeadDetail: leadUpdate.LeadDetail,
//       BDM: leadUpdate.BDM,
//     }));

//     const leadUpdateCounts = await LeadUpdate.findAll({
//       attributes: [
//         'LeadDetailId',
//         [sequelize.fn('COUNT', sequelize.col('LeadDetailId')), 'leadUpdateCount'],
//       ],
//       where: whereClause,
//       group: ['LeadDetailId'],
//     });

//     const leadUpdateCountMap = leadUpdateCounts.reduce((map, leadUpdate) => {
//       map[leadUpdate.LeadDetailId] = leadUpdate.leadUpdateCount;
//       return map;
//     }, {});

//     const formattedLeadUpdatesWithCount = formattedLeadUpdates.map((leadUpdate) => ({
//       ...leadUpdate,
//       leadUpdateCount: leadUpdateCountMap[leadUpdate.LeadDetailId] || 0,
//     }));

//     const bdmLeadUpdateCounts = await LeadUpdate.findAll({
//       attributes: [
//         'BDMId',
//         [sequelize.fn('COUNT', sequelize.col('BDMId')), 'leadUpdateCount'],
//       ],
//       where: whereClause,
//       group: ['BDMId'],
//       include: [{ model: Employee, as: 'BDM', attributes: ['EmployeeName'] }],
//     });

//     res.status(200).json({
//       leadUpdates: formattedLeadUpdatesWithCount,
//       pagination: {
//         total: count,
//         page: parseInt(page),
//         limit: parseInt(limit),
//       },
//       bdmLeadUpdateCounts,
//     });
//   } catch (error) {
//     console.error('Error retrieving lead updates by BDM for supervisor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

//07-08-2024
// exports.getLeadUpdatesByBDMForSupervisor = async (req, res) => {
//     try {
//       const { page = 1, limit = 10, date } = req.query;
//       const offset = (page - 1) * limit;
  
//       const whereClause = {
//         BDMId: { [Op.ne]: null },
//       };
//       if (date) {
//         whereClause.createdAt = {
//           [Op.gte]: new Date(date),
//           [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//         };
//       }
  
//       const leads = await Lead_Detail.findAndCountAll({
//         include: [
//           { model: Employee, as: 'Agent' },
//           { model: Employee, as: 'BDM' },
//           { model: Employee, as: 'Superviser' },
//           {
//             model: LeadUpdate,
//             as: 'Updates',
//             where: whereClause,
//             required: true,
//             include: [{ model: Employee, as: 'BDM' }],
//           },
//         ],
//         offset,
//         limit: parseInt(limit),
//       });
//       const formattedLeads = leads.rows.map((lead) => ({
//         ...lead.toJSON(),
//         callOnDiscussionCount: lead.Updates ? lead.Updates.length : 0, // Check if lead.Updates exists
//         // callOnDiscussions: lead.Updates ? lead.Updates.map((leadUpdate) => ({ // Check if lead.Updates exists
//         //   id: leadUpdate.id,
//         //   follow_up_date: leadUpdate.follow_up_date,
//         //   category: leadUpdate.category,
//         //   sub_category: leadUpdate.sub_category,
//         //   remark: leadUpdate.remark,
//         //   closure_month: leadUpdate.closure_month,
//         //   BDMId: leadUpdate.BDMId,
//         //   createdAt: leadUpdate.createdAt,
//         //   updatedAt: leadUpdate.updatedAt,
//         //   LeadDetailId: leadUpdate.LeadDetailId,
//         //   AgentId: leadUpdate.AgentId,
//         //   BDM: leadUpdate.BDM,
//         // })) : [], // Provide an empty array when lead.Updates is undefined
//       }));
//       const bdmLeadUpdateCounts = await LeadUpdate.findAll({
//         attributes: [
//           'BDMId',
//           [sequelize.fn('COUNT', sequelize.col('BDMId')), 'leadUpdateCount'],
//         ],
//         where: whereClause,
//         group: ['BDMId'],
//         include: [{ model: Employee, as: 'BDM', attributes: ['EmployeeName'] }],
//       });
  
//       res.status(200).json({
//         leads: formattedLeads,
//         pagination: {
//           total: leads.count,
//           page: parseInt(page),
//           limit: parseInt(limit),
//         },
//         bdmLeadUpdateCounts,
//       });
//     } catch (error) {
//       console.error('Error retrieving lead updates by BDM for supervisor:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };


exports.getLeadUpdatesByBDMForSupervisor = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      BDMId: { [Op.ne]: null },
    };
    
    if (date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lt]: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const leads = await Lead_Detail.findAndCountAll({
      include: [
        { model: Employee, as: 'Agent' },
        { model: Employee, as: 'BDM' },
        { model: Employee, as: 'Superviser' },
        {
          model: LeadUpdate,
          as: 'Updates',
          where: whereClause,
          required: true,
          include: [{ model: Employee, as: 'BDM' }],
        },
      ],
      offset,
      limit: parseInt(limit),
    });

    const formattedLeads = leads.rows.map((lead) => ({
      ...lead.toJSON(),
      callOnDiscussionCount: lead.Updates ? lead.Updates.length : 0,
    }));

    const bdmLeadUpdateCounts = await LeadUpdate.findAll({
      attributes: [
        'BDMId',
        [sequelize.fn('COUNT', sequelize.col('BDMId')), 'leadUpdateCount'],
      ],
      where: whereClause,
      group: ['BDMId'],
      include: [{ model: Employee, as: 'BDM', attributes: ['EmployeeName'] }],
    });

    res.status(200).json({
      leads: formattedLeads,
      pagination: {
        total: leads.count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      bdmLeadUpdateCounts,
    });
  } catch (error) {
    console.error('Error retrieving lead updates by BDM for supervisor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
























 

// exports.getLeadMeetingsForSupervisor = async (req, res) => {
//     try {
      
//       const { page = 1, limit = 10, date } = req.query;
//       const offset = (page - 1) * limit;
  
//       const whereClause = {};
//       if (date) {
//         whereClause.createdAt = {
//           [Op.gte]: new Date(date),
//           [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//         };
//       }
  
//       const { count, rows: leads } = await Lead_Detail.findAndCountAll({
//         include: [
//           { model: Employee, as: 'Agent' },
//           { model: Employee, as: 'BDM' },
//           { model: Employee, as: 'Superviser' },
//           {
//             model: Campaign,
//             as: 'Campaign',
//             attributes: ['CampaignId', 'CampaignName'],
//           },
//           {
//             model: lead_Meeting,
//             as: 'lead_meetings',
//             where: whereClause,
//           },
//         ],
//         offset,
//         limit: parseInt(limit),
//       });
  
//       const leadsWithMeetings = leads.map((lead) => ({
//         ...lead.toJSON(),
//         meeting_count: lead.lead_meetings.length,
//         meetings: lead.lead_meetings.map((meeting) => ({
//           ...meeting.toJSON(),
//           lead_id: lead.id,
//         })),
//       }));
  
//       const totalMeetings = await lead_Meeting.count({ where: whereClause });
  
//       res.status(200).json({
//         leads: leadsWithMeetings,
//         pagination: {
//           total: count,
//           page: parseInt(page),
//           limit: parseInt(limit),
//         },
//         total_meetings: totalMeetings,
//       });
//     } catch (error) {
//       console.error('Error retrieving leads with meetings for supervisor:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };




exports.getLeadMeetingsForSupervisor = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lt]: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const { count, rows: leads } = await Lead_Detail.findAndCountAll({
      include: [
        { model: Employee, as: 'Agent' },
        { model: Employee, as: 'BDM' },
        { model: Employee, as: 'Superviser' },
        {
          model: Campaign,
          as: 'Campaign',
          attributes: ['CampaignId', 'CampaignName'],
        },
        {
          model: lead_Meeting,
          as: 'lead_meetings',
          where: whereClause,
        },
      ],
      offset,
      limit: parseInt(limit),
    });

    const leadsWithMeetings = leads.map((lead) => ({
      ...lead.toJSON(),
      meeting_count: lead.lead_meetings.length,
      meetings: lead.lead_meetings.map((meeting) => ({
        ...meeting.toJSON(),
        lead_id: lead.id,
      })),
    }));

    const totalMeetings = await lead_Meeting.count({ where: whereClause });

    res.status(200).json({
      leads: leadsWithMeetings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      total_meetings: totalMeetings,
    });
  } catch (error) {
    console.error('Error retrieving leads with meetings for supervisor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



 

 

 

// exports.getLeadEstimationsForSupervisor = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, date } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = {};
//     if (date) {
//       whereClause.createdAt = {
//         [Op.gte]: new Date(date),
//         [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
//       };
//     }

//     const { count, rows: leads } = await Lead_Detail.findAndCountAll({
//       include: [
//         { model: Employee, as: 'Agent' },
//         { model: Employee, as: 'BDM' },
//         { model: Employee, as: 'Superviser' },
//         {
//           model: Campaign,
//           as: 'Campaign',
//           attributes: ['CampaignId', 'CampaignName'],
//         },
//         {
//           model: estimation,
//           as: 'estimations',
//           where: whereClause,
//         },
//       ],
//       offset,
//       limit: parseInt(limit),
//     });

//     const leadsWithEstimations = leads.map((lead) => ({
//       ...lead.toJSON(),
//       estimation_count: lead.estimations.length,
//       estimations: lead.estimations.map((estimation) => ({
//         ...estimation.toJSON(),
//         lead_id: lead.id,
//       })),
//     }));

//     const totalEstimations = await estimation.count({ where: whereClause });

//     res.status(200).json({
//       leads: leadsWithEstimations,
//       pagination: {
//         total: count,
//         page: parseInt(page),
//         limit: parseInt(limit),
//       },
//       total_estimations: totalEstimations,
//     });
//   } catch (error) {
//     console.error('Error retrieving leads with estimations for supervisor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

//07-08-2024
exports.getLeadEstimationsForSupervisor = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lt]: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const { count, rows: leads } = await Lead_Detail.findAndCountAll({
      include: [
        { model: Employee, as: 'Agent' },
        { model: Employee, as: 'BDM' },
        { model: Employee, as: 'Superviser' },
        {
          model: Campaign,
          as: 'Campaign',
          attributes: ['CampaignId', 'CampaignName'],
        },
        {
          model: estimation,
          as: 'estimations',
          where: whereClause,
        },
      ],
      offset,
      limit: parseInt(limit),
    });

    const leadsWithEstimations = leads.map((lead) => ({
      ...lead.toJSON(),
      estimation_count: lead.estimations.length,
      estimations: lead.estimations.map((estimation) => ({
        ...estimation.toJSON(),
        lead_id: lead.id,
      })),
    }));

    const totalEstimations = await estimation.count({ where: whereClause });

    res.status(200).json({
      leads: leadsWithEstimations,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      total_estimations: totalEstimations,
    });
  } catch (error) {
    console.error('Error retrieving leads with estimations for supervisor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


 




// exports.uploadLeads = async (req, res) => {
//   try {
//     const file = req.file;
//     const workbook = XLSX.readFile(file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     const leads = data.map((row) => ({
//       InquiryType: row.InquiryType,
//       Project: row.Project,
//       CustomerName: row.CustomerName,
//       MobileNo: row.MobileNo,
//       AlternateMobileNo: row.AlternateMobileNo,
//       WhatsappNo: row.WhatsappNo,
//       CustomerMailId: row.CustomerMailId,
//       pincode: row.pincode,
//       state_name: row.state_name,
//       region_name: row.region_name,
//       location: row.location,
//       site_location_address: row.site_location_address,
//       call_status: row.call_status,
//       call_type: row.call_type,
//       category: row.category,
//       sub_category: row.sub_category,
//       agent_remark: row.agent_remark,
//       bdm_remark: row.bdm_remark,
//       follow_up_date: row.follow_up_date,
//       lead_transfer_date: row.lead_transfer_date,
//       source_of_lead_generated: row.source_of_lead_generated,
//       close_month: row.close_month,
//       createdAt: row.createdAt,
//       updatedAt: row.updatedAt,
//       AgentId: row.AgentId,
//       BDMId: row.BDMId,
//       SuperviserID: row.SuperviserID,
//     }));

//     await Lead_Detail.bulkCreate(leads);

//     res.status(200).json({ message: 'Leads uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading leads:', error);

//     if (error.name === 'SequelizeDatabaseError') {
//       // Handle database-related errors
//       if (error.parent && error.parent.code === 'ER_DATA_TOO_LONG') {
//         res.status(400).json({ message: 'Data exceeds the maximum length allowed for a field' });
//       } else if (error.parent && error.parent.code === 'ER_NO_DEFAULT_FOR_FIELD') {
//         res.status(400).json({ message: 'Missing required field value' });
//       } else {
//         res.status(500).json({ message: 'Database error occurred' });
//       }
//     } else if (error.name === 'SequelizeValidationError') {
//       // Handle validation errors
//       const errors = error.errors.map((err) => ({
//         field: err.path,
//         message: err.message,
//       }));
//       res.status(400).json({ message: 'Validation failed', errors });
//     } else if (error instanceof multer.MulterError) {
//       // Handle multer-related errors
//       if (error.code === 'LIMIT_FILE_SIZE') {
//         res.status(400).json({ message: 'File size exceeds the limit' });
//       } else {
//         res.status(400).json({ message: 'File upload error occurred' });
//       }
//     } else {
//       // Handle other errors
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// };



exports.uploadLeads = async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const existingPhoneNumbers = new Set();
    const duplicatePhoneNumbers = new Set();
    const successfulUploads = [];

    for (const row of data) {
      const mobileNo = row.MobileNo;

      // Check if the mobile number already exists in the database
      const existingLead = await Lead_Detail.findOne({ where: { MobileNo: mobileNo } });

      if (existingLead || existingPhoneNumbers.has(mobileNo)) {
        duplicatePhoneNumbers.add(mobileNo);
      } else {
        existingPhoneNumbers.add(mobileNo);
        successfulUploads.push({
          InquiryType: row.InquiryType,
          Project: row.Project,
          CustomerName: row.CustomerName,
          MobileNo: mobileNo,
          AlternateMobileNo: row.AlternateMobileNo,
          WhatsappNo: row.WhatsappNo,
          CustomerMailId: row.CustomerMailId,
          pincode: row.pincode,
          state_name: row.state_name,
          region_name: row.region_name,
          location: row.location,
          site_location_address: row.site_location_address,
          call_status: row.call_status,
          call_type: row.call_type,
          category: row.category,
          sub_category: row.sub_category,
          agent_remark: row.agent_remark,
          bdm_remark: row.bdm_remark,
          follow_up_date: row.follow_up_date,
          lead_transfer_date: row.lead_transfer_date,
          source_of_lead_generated: row.source_of_lead_generated,
          close_month: row.close_month,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          AgentId: row.AgentId,
          BDMId: row.BDMId,
          SuperviserID: row.SuperviserID,
        });
      }
    }

    // Bulk create only the non-duplicate leads
    if (successfulUploads.length > 0) {
      await Lead_Detail.bulkCreate(successfulUploads);
    }
    let message = '';
    if (successfulUploads.length > 0) {
      message = `${successfulUploads.length} lead(s) uploaded successfully. `;
    }
    if (duplicatePhoneNumbers.size > 0) {
      message += `The following phone number(s) already exist: ${Array.from(duplicatePhoneNumbers).join(', ')}`;
    }
    
    // If no leads were uploaded and there were duplicates, adjust the message
    if (successfulUploads.length === 0 && duplicatePhoneNumbers.size > 0) {
      message = `No new leads uploaded. ${message}`;
    }

    res.status(200).json({ message, uploadedCount: successfulUploads.length, duplicateCount: duplicatePhoneNumbers.size });
  } catch (error) {
    console.error('Error uploading leads:', error);

    if (error.name === 'SequelizeDatabaseError') {
      // Handle database-related errors
      if (error.parent && error.parent.code === 'ER_DATA_TOO_LONG') {
        res.status(400).json({ message: 'Data exceeds the maximum length allowed for a field' });
      } else if (error.parent && error.parent.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        res.status(400).json({ message: 'Missing required field value' });
      } else {
        res.status(500).json({ message: 'Database error occurred' });
      }
    } else if (error.name === 'SequelizeValidationError') {
      // Handle validation errors
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({ message: 'Validation failed', errors });
    } else if (error instanceof multer.MulterError) {
      // Handle multer-related errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'File size exceeds the limit' });
      } else {
        res.status(400).json({ message: 'File upload error occurred' });
      }
    } else {
      // Handle other errors
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};





exports.getLeads = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtering parameters
    const filter = {};
    if (req.query.InquiryType) filter.InquiryType = req.query.InquiryType;
    if (req.query.Project) filter.Project = req.query.Project;
    if (req.query.CustomerName) filter.CustomerName = { [Op.like]: `%${req.query.CustomerName}%` };
    if (req.query.MobileNo) filter.MobileNo = req.query.MobileNo;

    // Sorting parameter
    const order = req.query.sort ? [[req.query.sort, 'ASC']] : [['createdAt', 'DESC']];

    const { count, rows } = await Lead_Detail.findAndCountAll({
      where: filter,
      limit,
      offset,
      order,
      include: [
      
        { model: Employee, as: 'BDM' },
      
        {
          model: Campaign,
          as: 'Campaign',
          attributes: ['CampaignId', 'CampaignName'],
        },
      ],
  

    });


    const totalPages = Math.ceil(count / limit);

    res.json({
      leads: rows,
      currentPage: page,
      totalPages,
      totalLeads: count
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'An error occurred while fetching leads' });
  }
};