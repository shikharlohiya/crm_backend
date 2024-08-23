const Lead_Detail = require('../../models/lead_detail');
const Employee = require('../../models/employee');
const Campaign = require('../../models/campaign');
const { Op } = require('sequelize');

// exports.createLead = async (req, res) => {
//   try {
//     const {
//       InquiryType,
//       call_status,
//       call_type,
//       site_location_address,
//       Project,
//       CustomerName,
//       MobileNo,
//       AlternateMobileNo,
//       WhatsappNo,
//       CustomerMailId,
//       state_name,
//       region_name,
//       location,
//       category,
//       sub_category,
//       agent_remark,
//       follow_up_date,
//       lead_transfer_date,
//       lead_owner,
//       source_of_lead_generated,
//       close_month,
//       AgentId,
//       BDMId,
//       pincode
//     } = req.body;

//     const leadData = {
//       InquiryType,
//       call_status,
//       call_type,
//       site_location_address,
//       Project,
//       CustomerName,
//       MobileNo,
//       AlternateMobileNo,
//       WhatsappNo,
//       CustomerMailId,
//       state_name,
//       region_name,
//       location,
//       category,
//       sub_category,
//       agent_remark,
//       follow_up_date,
//       lead_transfer_date,
//       lead_owner,
//       source_of_lead_generated,
//       close_month,
//       AgentId,
//       pincode,
//       BDMId
//     };

//     const lead = await Lead_Detail.create(leadData);

//     res.status(201).json({ message: 'Lead created successfully', lead });
//   } catch (error) {
//     console.error('Error creating lead:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



//26-07-2024
// exports.createLead = async (req, res) => {
//   try {
//     const {
//       InquiryType,
//       call_status,
//       call_type,
//       site_location_address,
//       Project,
//       CustomerName,
//       MobileNo,
//       AlternateMobileNo,
//       WhatsappNo,
//       CustomerMailId,
//       state_name,
//       region_name,
//       location,
//       category,
//       sub_category,
//       agent_remark,
//       follow_up_date,
//       lead_transfer_date,
//       lead_owner,
//       source_of_lead_generated,
//       close_month,
//       AgentId,
//       BDMId,
//       pincode
//     } = req.body;

//     // Check for existing lead with any of the phone numbers
//     const existingLead = await Lead_Detail.findOne({
//       where: {
//         [Op.or]: [
//           { MobileNo: { [Op.in]: [MobileNo, AlternateMobileNo, WhatsappNo] } },
//           { AlternateMobileNo: { [Op.in]: [MobileNo, AlternateMobileNo, WhatsappNo] } },
//           { WhatsappNo: { [Op.in]: [MobileNo, AlternateMobileNo, WhatsappNo] } }
//         ]
//       }
//     });

//     if (existingLead) {
//       let duplicateNumber;
//       if (existingLead.MobileNo === MobileNo || existingLead.MobileNo === AlternateMobileNo || existingLead.MobileNo === WhatsappNo) {
//         duplicateNumber = existingLead.MobileNo;
//       } else if (existingLead.AlternateMobileNo === MobileNo || existingLead.AlternateMobileNo === AlternateMobileNo || existingLead.AlternateMobileNo === WhatsappNo) {
//         duplicateNumber = existingLead.AlternateMobileNo;
//       } else {
//         duplicateNumber = existingLead.WhatsappNo;
//       }
//       return res.status(400).json({ 
//         message: 'A lead with this phone number already exists.',
//         duplicateNumber: duplicateNumber
//       });
//     }

//     const leadData = {
//       InquiryType,
//       call_status,
//       call_type,
//       site_location_address,
//       Project,
//       CustomerName,
//       MobileNo,
//       AlternateMobileNo,
//       WhatsappNo,
//       CustomerMailId,
//       state_name,
//       region_name,
//       location,
//       category,
//       sub_category,
//       agent_remark,
//       follow_up_date,
//       lead_transfer_date,
//       lead_owner,
//       source_of_lead_generated,
//       close_month,
//       AgentId,
//       pincode,
//       BDMId,
//       createdAt: new Date().toLocaleString('en-US', { 
//         timeZone: 'Asia/Kolkata',
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: false
//       }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
//       updatedAt: new Date().toLocaleString('en-US', { 
//         timeZone: 'Asia/Kolkata',
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: false
//       }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
//     };

//     const lead = await Lead_Detail.create(leadData);

//     res.status(201).json({ message: 'Lead created successfully', lead });
//   } catch (error) {
//     console.error('Error creating lead:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




exports.createLead = async (req, res) => {
  try {
    const {
      InquiryType,
      call_status,
      call_type,
      site_location_address,
      Project,
      CustomerName,
      MobileNo,
      AlternateMobileNo,
      WhatsappNo,
      CustomerMailId,
      state_name,
      region_name,
      location,
      category,
      sub_category,
      agent_remark,
      follow_up_date,
      lead_transfer_date,
      lead_owner,
      source_of_lead_generated,
      close_month,
      AgentId,
      BDMId,
      pincode
    } = req.body;

    // Check for existing lead with the same MobileNo
    const existingLead = await Lead_Detail.findOne({
      where: {
        MobileNo: MobileNo
      }
    });

    if (existingLead) {
      return res.status(400).json({
        message: 'A lead with this phone number already exists.',
        duplicateNumber: MobileNo
      });
    }

    const leadData = {
      InquiryType,
      call_status,
      call_type,
      site_location_address,
      Project,
      CustomerName,
      MobileNo,
      AlternateMobileNo,
      WhatsappNo,
      CustomerMailId,
      state_name,
      region_name,
      location,
      category,
      sub_category,
      agent_remark,
      follow_up_date,
      lead_transfer_date,
      lead_owner,
      source_of_lead_generated,
      close_month,
      AgentId,
      pincode,
      BDMId,


      createdAt: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2 '),
      
      updatedAt: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2 ')


    };

    const lead = await Lead_Detail.create(leadData);

    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLeadByMobileNo = async (req, res) => {
  try {
    const { mobileNo } = req.params;

    const lead = await Lead_Detail.findOne({
      where: {
        [Op.or]: [
          { MobileNo: mobileNo },
          { AlternateMobileNo: mobileNo },
          { WhatsappNo: mobileNo }
        ]
      },
  
    });

    if (!lead) {
      return res.status(200).json({ message: 'Lead not found for the given mobile number' });
    }

    res.status(200).json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.assignLeadToBDM = async (req, res) => {
    
    try {
      const { leadId } = req.params;
      const { BDMId } = req.body;
  
      const lead = await Lead_Detail.findByPk(leadId);
  
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
      lead.BDMId = BDMId;
      await lead.save();
  
      res.status(200).json({ message: 'Lead assigned to BDM successfully', lead });
    } catch (error) {
      console.error('Error assigning lead to BDM:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // exports.getLeadsByAgentId = async (req, res) => {
  //   try {
  //     const { agentId } = req.params;
  
  //     const leads = await Lead_Detail.findAll({
  //       where: { AgentId: agentId },
  //       include: [
  //           { model: Employee, as: 'Agent' },
  //           { model: Employee, as: 'BDM' },
  //           { model: Employee, as: 'Superviser' },
  //         ],
  //     });
  
  //     res.status(200).json({ leads });
  //   } catch (error) {
  //     console.error('Error retrieving leads:', error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // }

  //SELECT `LeadDetail`.`id`, `LeadDetail`.`InquiryType`, `LeadDetail`.`Project`, `LeadDetail`.`CustomerName`, `LeadDetail`.`MobileNo`, `LeadDetail`.`AlternateMobileNo`,
  //  `LeadDetail`.`WhatsappNo`, `LeadDetail`.`CustomerMailId`, `LeadDetail`.`pincode`, `LeadDetail`.`state_name`, `LeadDetail`.`region_name`, `LeadDetail`.`location`, `LeadDetail`.`site_location_address`, `LeadDetail`.`call_status`, `LeadDetail`.`call_type`, `LeadDetail`.`category`, `LeadDetail`.`sub_category`, `LeadDetail`.`agent_remark`, `LeadDetail`.`bdm_remark`, `LeadDetail`.`follow_up_date`, `LeadDetail`.`lead_transfer_date`, `LeadDetail`.`lead_owner`, `LeadDetail`.`source_of_lead_generated`, `LeadDetail`.`close_month`, `LeadDetail`.`createdAt`, `LeadDetail`.`updatedAt`, `LeadDetail`.`AgentId`, `LeadDetail`.`BDMId`, `LeadDetail`.`SuperviserID`, `Agent`.`EmployeeId` 
// AS `Agent.EmployeeId`, `Agent`.`EmployeePhone` AS `Agent.EmployeePhone`, `Agent`.`EmployeeName` AS `Agent.EmployeeName`, `Agent`.`EmployeeRoleID`
//  AS `Agent.EmployeeRoleID`, `Agent`.`EmployeePassword` AS `Agent.EmployeePassword`, `Agent`.`EmployeeMailId` AS `Agent.EmployeeMailId`, `Agent`.`EmployeeRegion` AS `Agent.EmployeeRegion`, `BDM`.`EmployeeId` AS `BDM.EmployeeId`, `BDM`.`EmployeePhone` AS `BDM.EmployeePhone`, `BDM`.`EmployeeName` AS `BDM.EmployeeName`, `BDM`.`EmployeeRoleID` AS `BDM.EmployeeRoleID`, `BDM`.`EmployeePassword` AS `BDM.EmployeePassword`, `BDM`.`EmployeeMailId` AS `BDM.EmployeeMailId`, `BDM`.`EmployeeRegion` AS `BDM.EmployeeRegion`, `Superviser`.`EmployeeId` AS `Superviser.EmployeeId`, `Superviser`.`EmployeePhone` AS `Superviser.EmployeePhone`, `Superviser`.`EmployeeName` AS `Superviser.EmployeeName`, `Superviser`.`EmployeeRoleID` 
// AS `Superviser.EmployeeRoleID`, `Superviser`.`EmployeePassword` AS `Superviser.EmployeePassword`, `Superviser`.`EmployeeMailId` AS `Superviser.EmployeeMailId`, `Superviser`.`EmployeeRegion` AS `Superviser.EmployeeRegion`, `Campaign`.`CampaignId` 
// AS `Campaign.CampaignId`, `Campaign`.`CampaignName` AS `Campaign.CampaignName` FROM `Lead_Detail` AS `LeadDetail` LEFT OUTER JOIN `Employee_table` AS `Agent` ON `LeadDetail`.`AgentId` = `Agent`.`EmployeeId` LEFT OUTER JOIN `Employee_table` AS `BDM` ON `LeadDetail`.`BDMId` = `BDM`.`EmployeeId` LEFT OUTER JOIN `Employee_table` AS `Superviser` ON `LeadDetail`.`SuperviserID` = `Superviser`.`EmployeeId` LEFT OUTER JOIN `Campaign_table` AS `Campaign` ON `LeadDetail`.`source_of_lead_generated` 
// = `Campaign`.`CampaignId` WHERE `LeadDetail`.`AgentId` = '10021203' AND `LeadDetail`.`source_of_lead_generated` IN (1, 2); 





  // exports.getLeadsByAgentId = async (req, res) => {
  //   try {
  //     const { agentId } = req.params;
  
  //     const employee = await Employee.findOne({
  //       where: { EmployeeId: agentId },
  //       include: [
  //         {
  //           model: Campaign,
  //           through: { attributes: [] },
  //           attributes: ['CampaignId'],
  //         },
  //       ],
  //     });
  
  //     if (!employee) {
  //       return res.status(404).json({ message: 'Agent not found' });
  //     }
  
  //     const assignedCampaignIds = employee.Campaigns.map(
  //       (campaign) => campaign.CampaignId
  //     );
  
  //     const leads = await Lead_Detail.findAll({
  //       where: {
  //         AgentId: agentId,
  //         source_of_lead_generated: {
  //           [Op.in]: assignedCampaignIds,
  //         },
  //       },
  //       include: [
  //         { model: Employee, as: 'Agent' },
  //         { model: Employee, as: 'BDM' },
  //         { model: Employee, as: 'Superviser' },
  //         {
  //           model: Campaign,
  //           as: 'Campaign', // Add the 'as' keyword with the alias name
  //           attributes: ['CampaignId', 'CampaignName'],
  //         },
  //       ],
  //     });
  
  //     res.status(200).json({ leads });
  //   } catch (error) {
  //     console.error('Error retrieving leads:', error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // };


  exports.getLeadsByAgentId = async (req, res) => {
  
    try {
      const { agentId } = req.params;
  
      const employee = await Employee.findOne({
        where: { EmployeeId: agentId },
        include: [
          {
            model: Campaign,
            through: { attributes: [] },
            attributes: ['CampaignId'],
          },
        ],
      });
  
      if (!employee) {
        return res.status(404).json({ message: 'Agent not found' });
      }
  
      const assignedCampaignIds = employee.Campaigns.map(
        (campaign) => campaign.CampaignId
      );
  
      const leads = await Lead_Detail.findAll({
        where: {
          AgentId: agentId,
          source_of_lead_generated: {
            [Op.in]: assignedCampaignIds,
          },
        },
        include: [
          { model: Employee, as: 'Agent' },
          { model: Employee, as: 'BDM' },
          { model: Employee, as: 'Superviser' },
          {
            model: Campaign,
            as: 'Campaign',
            attributes: ['CampaignId', 'CampaignName'],
          },
        ],
          order: [['createdAt', 'DESC']],
      });
  
      res.status(200).json({ leads });
    } catch (error) {
      console.error('Error retrieving leads:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

///////////////
exports.getColdLeadsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;

    const employee = await Employee.findOne({
      where: { EmployeeId: agentId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const leads = await Lead_Detail.findAll({
      where: {
        AgentId: agentId,
        category: {
          [Op.or]: ['cold', 'pending', 'closed']
        }
      },
      include: [
        { model: Employee, as: 'Agent' },
        { model: Employee, as: 'BDM' },
        { model: Employee, as: 'Superviser' }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ leads });
  } catch (error) {
    console.error('Error retrieving cold leads:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
















  

  