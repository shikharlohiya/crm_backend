const XLSX = require('xlsx');
const { Op } = require('sequelize');
const BiDayOp = require('../../models/BiDayOp');
const sequelize = require('../../models/index');
const { Sequelize } = require('sequelize');
const BiDayOpRemarks = require('../../models/BiDayOpRemarks');
const Employee = require("../../models/employee");
const BiBrooding = require('../../models/BiBrooding');
const multer = require("multer");
const path = require('path');
 

function excelDateToJSDate(excelDate) {
  if (typeof excelDate === "string" && excelDate.includes("-")) {
    return excelDate; // Already in the correct format
  }
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split("T")[0];
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
      const lotNumber = row["Lot Number"];

      if (!lotNumber) {
        invalidRecords.push(row);
        continue;
      }

      const recordData = {
        Branch: row["Branch"],
        Branch_Description: row["Branch Description"],
        Farm_Name: row["Farm Name"],
        Farmer_Mob: row["Farmer Mob"],
        Lot_Number: lotNumber,
        Age: row["Age"],
        Chicks_Housed_Quantity: row["Chicks Housed Quantity"],
        Mortality_Quantity: row["Mortality Quantity"],
        Mortality_Percentage: row["Mortality %"],
        Balance_Birds: row["Balance Birds"],
        Mort_Percentage_On_Date: row["Mort(%):On Date"],
        Mort_Percentage_Date_1: row["Mort(%):Date-1"],
        Mort_Percentage_Date_2: row["Mort(%):Date-2"],
        Mort_Percentage_Date_3: row["Mort(%):Date-3"],
        Mort_Percentage_Date_4: row["Mort(%):Date-4"],
        status: "open",
      };

      updatedRecords.push(recordData);
    }

    await sequelize.transaction(async (transaction) => {
      if (updatedRecords.length > 0) {
        const lotNumbers = updatedRecords.map((record) => record.Lot_Number);

        // Update all existing records to 'open' status, including those not in the current batch
        await BiDayOp.update(
          { status: "open" },
          {
            where: {
              [Op.or]: [
                { Lot_Number: lotNumbers },
                { status: { [Op.ne]: "open" } },
              ],
            },
            transaction,
          }
        );

        // Perform upsert for each record
        for (const record of updatedRecords) {
          await BiDayOp.upsert(record, {
            transaction,
            logging: false,
          });
        }
      }
    });

    let message = "";
    if (updatedRecords.length > 0) {
      message = `${updatedRecords.length} audit lead(s) uploaded/updated successfully. All records set to 'open' status. `;
    }
    if (invalidRecords.length > 0) {
      message += `${invalidRecords.length} record(s) skipped due to missing or invalid Lot Number.`;
    }

    if (updatedRecords.length === 0 && invalidRecords.length === 0) {
      message = "No audit leads uploaded or updated.";
    }

    res.status(200).json({
      message,
      uploadedCount: updatedRecords.length,
      skippedCount: invalidRecords.length,
    });
  } catch (error) {
    console.error("Error uploading audit leads:", error);

    if (error.name === "SequelizeDatabaseError") {
      if (error.parent && error.parent.code === "ER_DATA_TOO_LONG") {
        res.status(400).json({
          message: "Data exceeds the maximum length allowed for a field",
        });
      } else if (
        error.parent &&
        error.parent.code === "ER_NO_DEFAULT_FOR_FIELD"
      ) {
        res.status(400).json({ message: "Missing required field value" });
      } else {
        res.status(500).json({ message: "Database error occurred" });
      }
    } else if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({ message: "Validation failed", errors });
    } else if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "File size exceeds the limit" });
      } else {
        res.status(400).json({ message: "File upload error occurred" });
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};


const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.createBiDayOpRemark = async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const transaction = await sequelize.transaction();

    try {
      const {
        medicine_type,
        medicine_list,
        disease_name,
        dosage,
        Remarks,
        Follow_up_date,
        Lot_Number,
        AgentId,
      } = req.body;

      const biDayOpRemark = await BiDayOpRemarks.create(
        {
          medicine_type,
          medicine_list,
          disease_name,
          dosage,
          Remarks,
          Follow_up_date,
          Lot_Number,
          AgentId,
        },
        { transaction }
      );

      // Update the corresponding BiDayOpDetail record
      await BiDayOp.update(
        {
          last_action_date: sequelize.literal("CURRENT_TIMESTAMP"),
          // You might want to update other fields here if necessary
        },
        {
          where: { Lot_Number: Lot_Number },
          transaction,
        }
      );

      await transaction.commit();

      return res.status(200).json({
        message: "Created Bi-Day OP remark successfully",
        biDayOpRemark,
      });
    } catch (error) {
      await transaction.rollback();

      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        retries++;
        console.log(
          `Lock wait timeout. Retrying (${retries}/${MAX_RETRIES})...`
        );
        await sleep(RETRY_DELAY);
      } else {
        console.error("Error creating Bi-Day OP remark:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  console.error("Max retries reached. Failed to create Bi-Day OP remark.");
  return res.status(500).json({
    message: "Failed to create Bi-Day OP remark after multiple attempts",
  });
};



exports.getBiLeads = async (req, res) => {
    try {
      const { agentId } = req.query; // Assuming you'll pass the agent's ID as a query parameter
  
      if (!agentId) {
        return res.status(400).json({ message: "Agent ID is required" });
      }
  
      // First, fetch the agent's details to get their mapped regions
      const agent = await Employee.findByPk(agentId, {
        attributes: ["EmployeeName", "EmployeeRegion"],
      });
  
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
  
      // Assuming MappedRegions is stored as a comma-separated string
      const mappedRegions = agent.EmployeeRegion.split(",").map((region) =>
        region.trim()
      );
  
      // Fetch audit leads for the mapped regions
      const auditLeads = await BiDayOp.findAll({
        where: {
        Branch_Description: {
            [Op.in]: mappedRegions,
          },
        },
        order: [["updatedAt", "DESC"]],
      });
      const totalCount = auditLeads.length;
  
      res.status(200).json({
        data: auditLeads,
        agent: {
          name: agent.EmployeeName,
          mappedRegions: mappedRegions,
        },
        totalCount: totalCount,
      });
    } catch (error) {
      console.error("Error retrieving audit leads:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  exports.getBiLeadRemarksByLotNumber = async (req, res) => {
    try {
      const { lotNumber } = req.params;
  
      const auditLeadRemarks = await BiDayOpRemarks.findAll({
        order: [["updatedAt", "DESC"]],
        where: {
          Lot_Number: lotNumber,
        },
        include: [
          {
            model: Employee,
            as: "Agent",
            attributes: ["EmployeeName"],
          },
        ],
      });
  
      if (auditLeadRemarks.length === 0) {
        return res
          .status(200)
          .json({
            message: "No audit lead remarks found for the specified Lot Number",
          });
      }
  
      res.status(200).json({ auditLeadRemarks });
    } catch (error) {
      console.error("Error retrieving audit lead remarks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };



  exports.getAllLeadsForDayOpSuperviser = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        region,
        status,
        sortBy = "updatedAt",
        sortOrder = "DESC",
      } = req.query;
  
      const offset = (page - 1) * limit;
  
      let whereClause = {};
      if (region) whereClause.Branch_Description = region;
      if (status) whereClause.status = status;
  
      const { count, rows: auditLeads } = await BiDayOp.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      res.status(200).json({
        data: auditLeads,
        totalCount: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error("Error retrieving audit leads:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };






  /////////////

  exports.uploadBiBrooding = async (req, res) => {
    try {
      const file = req.file;
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
  
      const updatedRecords = [];
      const invalidRecords = [];
  
      for (const row of data) {
        const lotNo = row["LOT NO"];
  
        if (!lotNo) {
          invalidRecords.push(row);
          continue;
        }
  
        const recordData = {
          ZONE: row["ZONE"],
          REGION: row["REGION"],
          BRANCH: row["BRANCH"],
          LOT_NO: lotNo,
          FARMER_NAME: row["FARMER NAME"],
          AGE: row["AGE"],
          SHED_TYPE: row["SHED TYPE"],
          CHICKS_PLANNED_HOUSED: row["CHICKS PLANNED/HOUSED"],
          FARMER_CONTACT_NO: row["FARMER CONTACT NO"],
          LOT_STATUS: row["LOT STATUS"],
          status: "open",
        };
  
        updatedRecords.push(recordData);
      }
  
      await sequelize.transaction(async (transaction) => {
        if (updatedRecords.length > 0) {
          const lotNumbers = updatedRecords.map((record) => record.LOT_NO);
  
          // Update all existing records to 'open' status, including those not in the current batch
          await BiBrooding.update(
            { status: "open" },
            {
              where: {
                [Op.or]: [
                  { LOT_NO: lotNumbers },
                  { status: { [Op.ne]: "open" } },
                ],
              },
              transaction,
            }
          );
  
          // Perform upsert for each record
          for (const record of updatedRecords) {
            await BiBrooding.upsert(record, {
              transaction,
              logging: false,
            });
          }
        }
      });
  
      let message = "";
      if (updatedRecords.length > 0) {
        message = `${updatedRecords.length} Bi-Brooding record(s) uploaded/updated successfully. All records set to 'open' status. `;
      }
      if (invalidRecords.length > 0) {
        message += `${invalidRecords.length} record(s) skipped due to missing or invalid LOT NO.`;
      }
  
      if (updatedRecords.length === 0 && invalidRecords.length === 0) {
        message = "No Bi-Brooding records uploaded or updated.";
      }
  
      res.status(200).json({
        message,
        uploadedCount: updatedRecords.length,
        skippedCount: invalidRecords.length,
      });
    } catch (error) {
      console.error("Error uploading Bi-Brooding records:", error);
  
      if (error.name === "SequelizeDatabaseError") {
        if (error.parent && error.parent.code === "ER_DATA_TOO_LONG") {
          res.status(400).json({
            message: "Data exceeds the maximum length allowed for a field",
          });
        } else if (
          error.parent &&
          error.parent.code === "ER_NO_DEFAULT_FOR_FIELD"
        ) {
          res.status(400).json({ message: "Missing required field value" });
        } else {
          res.status(500).json({ message: "Database error occurred" });
        }
      } else if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        res.status(400).json({ message: "Validation failed", errors });
      } else if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "File size exceeds the limit" });
        } else {
          res.status(400).json({ message: "File upload error occurred" });
        }
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };


  