const Lead_Detail = require("../../models/lead_detail");
const Employee = require("../../models/employee");
const Estimation = require("../../models/estimation");
const Campaign = require("../../models/campaign");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("../../Library/awsS3");
const LeadDetail = require("../../models/lead_detail");
const LeadLog = require("../../models/leads_logs");
const sequelize = require("../../models/index");

exports.getLeadsByBDMId = async (req, res) => {
  try {
    const { bdmId } = req.params;

    // Fetch all leads
    const leads = await Lead_Detail.findAll({
      where: { BDMId: bdmId },
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
    });

    // Calculate counts for all categories
    const totalCount = leads.length;
    const categoryCounts = leads.reduce((acc, lead) => {
      const category = lead.category || "uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Prepare response object
    const response = {
      leads,
      counts: {
        total: totalCount,
        ...categoryCounts,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving leads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBDMRemarks = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { bdm_remark } = req.body;

    const lead = await Lead_Detail.findOne({ where: { id: leadId } });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.bdm_remark = bdm_remark;
    await lead.save();

    res.status(200).json({ message: "BDM remarks updated successfully", lead });
  } catch (error) {
    console.error("Error updating BDM remarks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.findAll({
      include: [
        {
          model: Lead_Detail,
          attributes: ["id", "CustomerName", "MobileNo", "Project", "BDMId"],
          include: [
            {
              model: Employee,
              as: "BDM",
              attributes: ["EmployeeId", "EmployeeName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedEstimations = estimations.map((estimation) => {
      const estJson = estimation.toJSON();
      return {
        ...estJson,
        BdmName: estJson.LeadDetail?.BDM?.EmployeeName || null,
        BdmId: estJson.LeadDetail?.BDMId || estJson.Bdm_id || null,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedEstimations.length,
      data: formattedEstimations,
    });
  } catch (error) {
    console.error("Error fetching estimations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateEstimationStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      estimation_id,
      status,
      employeeId,
      estimation_amount,
      estimationNumber,
      firm_farmer_name,
      LeadDetailId,
      category,
      sub_category,
      follow_up_date,
      remark,
      Approval_from,
    } = req.body;

    // Validate the status
    const validStatuses = [
      "Generated",
      "Need for Approval",
      "Converted",
      "Rejected",
    ];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: Need for Approval, Generated, Estimation Shared, Converted",
      });
    }

    // Check if the employee exists
    const employee = await Employee.findByPk(employeeId, { transaction: t });
    if (!employee) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const estimation = await Estimation.findByPk(id, { transaction: t });

    if (!estimation) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Estimation not found",
      });
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
      const files = req.files.images;
      for (const file of files) {
        const documentResponse = await uploadFile(file, "estimation");
        const imageUrl = `https://ib-paultry-image.s3.ap-south-2.amazonaws.com/${documentResponse.Key}`;
        imageUrls.push(imageUrl);
      }
    }

    // Prepare the update object for Estimation
    const updateData = {
      status,
      firm_farmer_name,
      lastUpdatedBy: employeeId,
      estimation_amount: estimation_amount || estimation.estimation_amount,
      estimationNumber: estimationNumber || estimation.estimationNumber,
      ho_document: imageUrls,
      Ho_executive_id: employeeId,
      Approval_from,
    };

    // Add Estimation_generated_date only if the status is 'Generated'
    if (status === "Generated") {
      updateData.Estimation_generated_date = new Date();
    }

    // Update the estimation
    await estimation.update(updateData, { transaction: t });

    // Update LeadDetail
    const leadDetail = await LeadDetail.findByPk(LeadDetailId, {
      transaction: t,
    });
    if (leadDetail) {
      await leadDetail.update(
        {
          follow_up_date,
          category,
          sub_category,
          bdm_remark: remark,
          last_action: `Estimation ${status}`,
        },
        { transaction: t }
      );
    } else {
      console.warn(`LeadDetail with id ${LeadDetailId} not found.`);
    }

    // Create a log entry
    await LeadLog.create(
      {
        action_type: `Estimation ${status}`,
        category,
        sub_category,
        remarks: remark,
        performed_by: employeeId,
        LeadDetailId,
        follow_up_date,
        status: status,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Estimation updated successfully",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating estimation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateEstimationDownloadStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { estimation_id, download_done, employeeId } = req.body;

    if (!download_done) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "download_done parameter is required and must be true",
      });
    }

    const estimation = await Estimation.findByPk(estimation_id, {
      transaction: t,
    });

    if (!estimation) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Estimation not found",
      });
    }

    if (estimation.status !== "Generated") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          'Estimation status must be "Generated" to update to "Estimation Shared"',
      });
    }

    // Update the estimation
    await estimation.update(
      {
        status: "Estimation Shared",
        lastUpdatedBy: employeeId,
      },
      { transaction: t }
    );

    // Update LeadDetail
    const leadDetail = await LeadDetail.findByPk(estimation.LeadDetailId, {
      transaction: t,
    });
    if (leadDetail) {
      await leadDetail.update(
        {
          last_action: "Estimation Shared",
        },
        { transaction: t }
      );
    } else {
      console.warn(`LeadDetail with id ${estimation.LeadDetailId} not found.`);
    }

    // Create a log entry
    await LeadLog.create(
      {
        action_type: "Estimation Shared",
        // category: leadDetail ? leadDetail.category : null,
        // sub_category: leadDetail ? leadDetail.sub_category : null,
        // remarks: 'Estimation downloaded and shared',
        performed_by: employeeId,
        // LeadDetailId: estimation.LeadDetailId,
        // follow_up_date: leadDetail ? leadDetail.follow_up_date : null,
        // status: 'Estimation Shared'
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Estimation status updated to "Estimation Shared" successfully',
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating estimation download status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
