const Lead_Detail = require("../../models/lead_detail");
const Employee = require("../../models/employee");
const Campaign = require("../../models/campaign");
const LeadLog = require("../../models/leads_logs");
const { Op } = require("sequelize");
const moment = require("moment");
const FollowUPByAgent = require("../../models/FollowUpByAgent");
const sequelize = require("../../models/index");

exports.createLead = async (req, res) => {
  const t = await sequelize.transaction();

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
      bdm_remark,
      follow_up_date,
      lead_transfer_date,
      lead_owner,
      source_of_lead_generated,
      close_month,
      AgentId,
      BDMId,
      pincode,
      lead_created_by,
    } = req.body;

    // Check for existing lead with the same MobileNo
    const existingLead = await Lead_Detail.findOne({
      where: {
        MobileNo: MobileNo,
      },
      transaction: t,
    });

    if (existingLead) {
      await t.rollback();
      return res.status(400).json({
        message: "A lead with this phone number already exists.",
        duplicateNumber: MobileNo,
      });
    }

    // Determine if the lead is created by an agent or a BDM
    const isAgentCreated = !!AgentId;
    const isBDMCreated = !!BDMId;

    if (!isAgentCreated && !isBDMCreated) {
      await t.rollback();
      return res.status(400).json({
        message: "Either AgentId or BDMId must be provided.",
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
      agent_remark: isAgentCreated ? agent_remark : null,
      bdm_remark: isBDMCreated ? bdm_remark : null,
      follow_up_date,
      lead_transfer_date,
      lead_owner,
      source_of_lead_generated,
      close_month,
      AgentId: isAgentCreated ? AgentId : null,
      BDMId: isBDMCreated ? BDMId : null,
      pincode,
      lead_created_by,
      last_action: isAgentCreated
        ? "Lead Created by Agent"
        : "Lead Created by BDM",
    };

    const lead = await Lead_Detail.create(leadData, { transaction: t });

    // Create a log entry for the new lead
    await LeadLog.create(
      {
        LeadDetailId: lead.id,
        action_type: isAgentCreated
          ? "Lead Created by Agent"
          : "Lead Created by BDM",
        category: category,
        sub_category: sub_category,
        remarks: isAgentCreated ? agent_remark : bdm_remark,
        performed_by: isAgentCreated ? AgentId : BDMId,
        follow_up_date: follow_up_date,
      },
      { transaction: t }
    );

    // If we reach here, no errors were thrown, so we commit the transaction
    await t.commit();

    res.status(201).json({
      message: isAgentCreated
        ? "Lead created successfully by Agent"
        : "Lead created successfully by BDM",
      lead,
    });
  } catch (error) {
    // If we catch any error, we rollback the transaction
    await t.rollback();
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get lead data by mobile number
exports.getLeadByMobileNo = async (req, res) => {
  try {
    const { mobileNo } = req.params;

    const lead = await Lead_Detail.findOne({
      where: {
        [Op.or]: [
          { MobileNo: mobileNo },
          { AlternateMobileNo: mobileNo },
          { WhatsappNo: mobileNo },
        ],
      },
    });

    if (!lead) {
      return res
        .status(200)
        .json({ message: "Lead not found for the given mobile number" });
    }

    res.status(200).json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//assign lead to bdm --for future
exports.assignLeadToBDM = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { BDMId } = req.body;

    const lead = await Lead_Detail.findByPk(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.BDMId = BDMId;
    await lead.save();

    res
      .status(200)
      .json({ message: "Lead assigned to BDM successfully", lead });
  } catch (error) {
    console.error("Error assigning lead to BDM:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get lead by agentId
exports.getLeadsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;

    const employee = await Employee.findOne({
      where: { EmployeeId: agentId },
      include: [
        {
          model: Campaign,
          through: { attributes: [] },
          attributes: ["CampaignId"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Agent not found" });
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
        { model: Employee, as: "Agent" },
        { model: Employee, as: "BDM" },
        { model: Employee, as: "Superviser" },
        {
          model: Campaign,
          as: "Campaign",
          attributes: ["CampaignId", "CampaignName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ leads });
  } catch (error) {
    console.error("Error retrieving leads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get cold lead by agent Id
exports.getColdLeadsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;

    const employee = await Employee.findOne({
      where: { EmployeeId: agentId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const leads = await Lead_Detail.findAll({
      where: {
        AgentId: agentId,
        category: {
          [Op.or]: ["cold", "pending", "closed"],
        },
      },
      include: [
        { model: Employee, as: "Agent" },
        { model: Employee, as: "BDM" },
        { model: Employee, as: "Superviser" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ leads });
  } catch (error) {
    console.error("Error retrieving cold leads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createFollowUpByAgent = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      LeadDetailId,
      AgentId,
      follow_up_date,
      category,
      sub_category,
      remark,
      closure_month,
    } = req.body;

    // Parse the IDs to integers
    const leadDetailId = parseInt(LeadDetailId, 10);
    const agentId = parseInt(AgentId, 10);

    // Check if the IDs are valid numbers
    if (isNaN(leadDetailId) || isNaN(agentId)) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid LeadDetailId or AgentId" });
    }

    const leadDetail = await Lead_Detail.findByPk(leadDetailId, {
      transaction: t,
    });
    const agent = await Employee.findByPk(agentId, { transaction: t });

    if (!leadDetail) {
      await t.rollback();
      return res.status(400).json({ error: "Lead is not found" });
    }
    if (!agent) {
      await t.rollback();
      return res.status(400).json({ error: "Agent is not found" });
    }

    // Create the follow-up
    const followUp = await FollowUPByAgent.create(
      {
        follow_up_date,
        category,
        sub_category,
        remark,
        LeadDetailId: leadDetailId,
        AgentId: agentId,
        closure_month,
      },
      { transaction: t }
    );

    // Update the Lead_Detail
    await leadDetail.update(
      {
        follow_up_date,
        category,
        sub_category,
        agent_remark: remark,
        AgentId: agentId,
        last_action: "Follow-up by Agent",

        close_month: closure_month,
      },
      { transaction: t }
    );

    // Create a log entry
    await LeadLog.create(
      {
        action_type: "Follow-up by Agent",
        category,
        sub_category,
        remarks: remark,
        performed_by: agentId,
        LeadDetailId: leadDetailId,
        follow_up_date,
      },
      { transaction: t }
    );

    // If we reach here, no errors were thrown, so we commit the transaction
    await t.commit();

    res.status(201).json({
      message: "Follow up data has been successfully saved",
      followUp,
      updatedLeadDetail: leadDetail,
    });
  } catch (error) {
    // If we catch any error, we rollback the transaction
    await t.rollback();
    console.error("Error in createFollowUpByAgent:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
