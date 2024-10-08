// controllers/bdmActionController.js
const { Op } = require("sequelize");
const sequelize = require("../../models/index");
const BdmLeadAction = require("../../models/BdmLeadAction");
const Lead_Detail = require("../../models/lead_detail");
const Attendance = require("../../models/Attendence");

exports.handleBatchLeadActions = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      bdmId,
      HO_task,
      self_task,
      other_task,
      attendanceType,
      latitude,
      longitude,
    } = req.body;

    if (!bdmId || !attendanceType || !latitude || !longitude) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const processActions = async (tasks, taskType) => {
      return Promise.all(
        tasks.map(async (task) => {
          if (taskType === "other_task") {
            // Handle other_task
            return BdmLeadAction.create(
              {
                BDMId: bdmId,
                task_type: "other_task",
                task_name: task.task_name,
                remarks: task.remarks,
              },
              { transaction }
            );
          } else {
            // Handle HO_task and self_task
            const {
              id,
              action_type,
              specific_action,
              new_follow_up_date,
              remarks,
            } = task;

            const bdmAction = await BdmLeadAction.create(
              {
                LeadId: id,
                BDMId: bdmId,
                task_type: taskType,
                action_type,
                specific_action:
                  action_type === "confirm" ? specific_action : null,
                new_follow_up_date:
                  action_type === "postpone" ? new_follow_up_date : null,
                remarks,
              },
              { transaction }
            );

            // Update Lead_Detail
            const lead = await Lead_Detail.findByPk(id, { transaction });
            if (!lead) {
              throw new Error(`Lead with id ${id} not found`);
            }

            if (action_type === "confirm") {
              lead.last_action = specific_action;
            } else if (action_type === "postpone") {
              lead.follow_up_date = new Date(new_follow_up_date);
              lead.bdm_remark = remarks || lead.bdm_remark;
            }

            await lead.save({ transaction });

            return bdmAction;
          }
        })
      );
    };

    const processedHOTasks = HO_task
      ? await processActions(HO_task, "HO_task")
      : [];
    const processedSelfTasks = self_task
      ? await processActions(self_task, "self_task")
      : [];
    const processedOtherTasks = other_task
      ? await processActions(other_task, "other_task")
      : [];

    // Create an Attendance record with location
    const attendance = await Attendance.create(
      {
        EmployeeId: bdmId,
        AttendanceType: attendanceType,
        Latitude: latitude,
        Longitude: longitude,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      message:
        "Batch lead actions processed and attendance marked successfully",
      HO_task: processedHOTasks,
      self_task: processedSelfTasks,
      other_task: processedOtherTasks,
      attendance,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing batch lead actions and attendance:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.handleBdmCheckout = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { bdmId, completedTasks, attendanceType, latitude, longitude } =
      req.body;

    if (
      !bdmId ||
      !completedTasks ||
      !Array.isArray(completedTasks) ||
      !attendanceType ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Update completion status for completed tasks
    await Promise.all(
      completedTasks.map(async (taskId) => {
        await BdmLeadAction.update(
          { completion_status: "completed" },
          {
            where: {
              id: taskId,
              BDMId: bdmId,
              task_type: "HO_task",
              action_type: "confirm",
              completion_status: null,
            },
            transaction,
          }
        );
      })
    );

    // Fetch all confirmed HO_tasks for the BDM from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const confirmedTasks = await BdmLeadAction.findAll({
      where: {
        BDMId: bdmId,
        task_type: "HO_task",
        action_type: "confirm",
        action_date: {
          [Op.gte]: today,
        },
      },
      transaction,
    });

    // Mark remaining tasks as not completed
    await Promise.all(
      confirmedTasks.map(async (task) => {
        if (!completedTasks.includes(task.id)) {
          await task.update(
            { completion_status: "not_completed" },
            { transaction }
          );
        }
      })
    );

    // Create an Attendance record for checkout with location
    const attendance = await Attendance.create(
      {
        EmployeeId: bdmId,
        AttendanceType: attendanceType,
        Latitude: latitude,
        Longitude: longitude,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      message: "Checkout processed successfully",
      completedTasks: completedTasks.length,
      notCompletedTasks: confirmedTasks.length - completedTasks.length,
      attendance,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing BDM checkout:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
