const Lead_Detail = require('../../models/lead_detail');
const Employee = require('../../models/employee');
const Estimation = require('../../models/estimation');
const Campaign = require('../../models/campaign');

// exports.getLeadsByBDMId = async (req, res) => {
//   try {
//     const { bdmId } = req.params;

//     const leads = await Lead_Detail.findAll({
//       where: { BDMId: bdmId },
//       include: [
//         { model: Employee, as: 'Agent' },
//         { model: Employee, as: 'BDM' },
//         { model: Employee, as: 'Superviser' },
   
//           {
//             model: Campaign,
//             as: 'Campaign',
//             attributes: ['CampaignId', 'CampaignName'],
//           },
      
//       ],
//     });

//     res.status(200).json({ leads });
//   } catch (error) {
//     console.error('Error retrieving leads:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// exports.getLeadsByBDMId = async (req, res) => {
//   try {
//     const { bdmId } = req.params;

//     // Fetch all leads
//     const leads = await Lead_Detail.findAll({
//       where: { BDMId: bdmId },
//       include: [
//         { model: Employee, as: 'Agent' },
//         { model: Employee, as: 'BDM' },
//         { model: Employee, as: 'Superviser' },
//         {
//           model: Campaign,
//           as: 'Campaign',
//           attributes: ['CampaignId', 'CampaignName'],
//         },
//       ],
//     });

//     // Calculate counts
//     const totalCount = leads.length;
//     const hotCount = leads.filter(lead => lead.category === 'Hot').length;
//     const pendingCount = leads.filter(lead => lead.category === 'Pending').length;
//     const closedCount = leads.filter(lead => lead.category === 'Closed').length;
//     const warmCount = leads.filter(lead => lead.category === 'Warm').length;
//     const coldCount = leads.filter(lead => lead.category === 'Cold').length;

//     // Prepare response object
//     const response = {
//       leads,
//       counts: {
//         total: totalCount,
//         hot: hotCount,
//         pending: pendingCount,
//         closed: closedCount,
//         warm: warmCount,
//         cold: coldCount
//       }
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error('Error retrieving leads:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


exports.getLeadsByBDMId = async (req, res) => {
  try {
    const { bdmId } = req.params;

    // Fetch all leads
    const leads = await Lead_Detail.findAll({
      where: { BDMId: bdmId },
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
    });

    // Calculate counts for all categories
    const totalCount = leads.length;
    const categoryCounts = leads.reduce((acc, lead) => {
      const category = lead.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Prepare response object
    const response = {
      leads,
      counts: {
        total: totalCount,
        ...categoryCounts
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving leads:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateBDMRemarks = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { bdm_remark } = req.body;

    const lead = await Lead_Detail.findOne({ where: { id: leadId } });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.bdm_remark = bdm_remark;
    await lead.save();

    res.status(200).json({ message: 'BDM remarks updated successfully', lead });
  } catch (error) {
    console.error('Error updating BDM remarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getAllEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.findAll({
      include: [
        {
          model: Lead_Detail,
          attributes: ['id', 'CustomerName', 'MobileNo', 'Project'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: estimations.length,
      data: estimations,
    });
  } catch (error) {
    console.error('Error fetching estimations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



// exports.updateEstimationStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, employeeId } = req.body;

//     // Validate the status
//     const validStatuses = ['Pending', 'Need for Approval', 'Generated', 'Estimation Shared'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be one of: Pending, Need for Approval, Generated, Estimation Shared',
//       });
//     }

//     // Check if the employee exists
//     const employee = await Employee.findByPk(employeeId);
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found',
//       });
//     }

//     const estimation = await Estimation.findByPk(id);

//     if (!estimation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Estimation not found',
//       });
//     }

//     // Update the estimation
//     await estimation.update({
//       status,
//       lastUpdatedBy: employeeId,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Estimation status updated successfully',
//       data: {
//         ...estimation.toJSON(),
//         lastUpdatedByEmployee: {
//           EmployeeId: employee.EmployeeId,
//           EmployeeName: employee.EmployeeName,
//           EmployeeRole: employee.EmployeeRoleID,
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Error updating estimation status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.updateEstimationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, employeeId, estimation_amount, estimationNumber } = req.body;

    // Validate the status
    const validStatuses = ['Pending', 'Need for Approval', 'Generated', 'Estimation Shared'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, Need for Approval, Generated, Estimation Shared',
      });
    }

    // Check if the employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const estimation = await Estimation.findByPk(id);

    if (!estimation) {
      return res.status(404).json({
        success: false,
        message: 'Estimation not found',
      });
    }

    // Handle file upload
    let documentLink = null;
    if (req.file) {
      const { filename, originalname } = req.file;
      const newPath = path.join('uploads', originalname);
      fs.renameSync(req.file.path, newPath);
      documentLink = `/uploads/${originalname}`;
    }

    // Update the estimation
    await estimation.update({
      status,
      lastUpdatedBy: employeeId,
      estimation_amount: estimation_amount || estimation.estimation_amount,
      estimationNumber: estimationNumber || estimation.estimationNumber,
      ...(documentLink && { documents: [...(estimation.documents || []), documentLink] }),
    });

    res.status(200).json({
      success: true,
      message: 'Estimation updated successfully',
      data: {
        ...estimation.toJSON(),
        lastUpdatedByEmployee: {
          EmployeeId: employee.EmployeeId,
          EmployeeName: employee.EmployeeName,
          EmployeeRole: employee.EmployeeRoleID,
        },
      },
    });
  } catch (error) {
    console.error('Error updating estimation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



