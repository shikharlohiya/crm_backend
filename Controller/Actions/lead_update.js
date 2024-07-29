const Lead_Detail = require('../../models/lead_detail');
const Employee = require('../../models/employee');
const LeadUpdate = require('../../models/lead_update');

// exports.createLeadUpdate = async (req, res) => {
//   try {
//     const { leadDetailId, agentId, campaignId, follow_up_date, category, sub_category, agent_remark , closure_month} = req.body;

//     // Find the lead detail, agent, and campaign
//     const leadDetail = await Lead_Detail.findByPk(leadDetailId);
//     const agent = await Employee.findByPk(agentId);
//     // const campaign = await Campaign.findByPk(campaignId);

//     // Check if the lead detail, agent, and campaign exist
//     if (!leadDetail || !agent) {
//       return res.status(404).json({ error: 'Lead detail, agent, or campaign not found' });
//     }

//     // Create a new lead update
//     const leadUpdate = await LeadUpdate.create({
//       follow_up_date,
//       category,
//       sub_category,
//       agent_remark,
//       LeadDetailId: leadDetail.id,
//       AgentId: agent.EmployeeId,
//       closure_month
//     });

//     res.status(201).json({ message: 'Lead update created successfully', leadUpdate });
//   } catch (error) {
//     console.error('Error creating lead update:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };






exports.createLeadUpdate = async (req, res) => {
  try {
    const { leadDetailId, agentId, bdmId, campaignId, follow_up_date, category, sub_category, remark, closure_month } = req.body;

    const leadDetail = await Lead_Detail.findByPk(leadDetailId);
    const agent = agentId ? await Employee.findByPk(agentId) : null;
    const bdm = bdmId ? await Employee.findByPk(bdmId) : null;

    if (!leadDetail || (!agent && !bdm)) {
      return res.status(404).json({ error: 'Lead detail or employee not found' });
    }

    const leadUpdate = await LeadUpdate.create({
      follow_up_date,
      category,
      sub_category,
      remark,
      LeadDetailId: leadDetail.id,
      AgentId: agent ? agent.EmployeeId : null,
      BDMId: bdm ? bdm.EmployeeId : null,
      closure_month,
    });

    res.status(201).json({ message: 'Lead update created successfully', leadUpdate });
  } catch (error) {
    console.error('Error creating lead update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getLeadUpdatesByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Find the lead detail
    const leadDetail = await Lead_Detail.findByPk(leadId);

    // Check if the lead detail exists
    if (!leadDetail) {
      return res.status(404).json({ error: 'Lead detail not found' });
    }

    // Find all lead updates for the given lead ID, ordered by the latest date and time
    // const leadUpdates = await LeadUpdate.findAll({
    //   where: {
    //     LeadDetailId: leadDetail.id,
    //   },
    //   order: [['createdAt', 'DESC']],
    //   include: [
    //     {
    //       model: Employee,
    //       as: 'Agent',
    //       attributes: ['EmployeeId', 'EmployeeName'], // Include desired employee attributes
    //     },
    //   ],
    // });

    const leadUpdates = await LeadUpdate.findAll({
      where: {
        LeadDetailId: leadDetail.id,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Employee,
          as: 'Agent',
          attributes: ['EmployeeId', 'EmployeeName'],
        },
        {
          model: Employee,
          as: 'BDM',
          attributes: ['EmployeeId', 'EmployeeName'],
        },
      ],
    });
    
    


    res.status(200).json({ leadUpdates });
  } catch (error) {
    console.error('Error retrieving lead updates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

