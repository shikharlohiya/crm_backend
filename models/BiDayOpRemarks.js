const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("./index");
const BiDayOpDetail = require("./BiDayOp");
const Employee = require("./employee");



class BiDayOpRemarks extends Model {}

BiDayOpRemarks.init(
  {
    medicine_type: {
      type: DataTypes.STRING,
    },
    medicine_list: {
      type: DataTypes.STRING,
    },
    disease_name: {
      type: DataTypes.STRING,
    },
    dosage: {
      type: DataTypes.STRING,
    },
    Remarks: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    Follow_up_date: {
      type: DataTypes.DATE
    
    },
},
  {
    sequelize,
    modelName: "bi_day_op_remark",
    tableName: "bi_day_op_remark",
  }
);



Employee.hasMany(BiDayOpRemarks, {
    foreignKey: "AgentId",
    as: "AgentBIUpdate",
  });
  BiDayOpRemarks.belongsTo(Employee, { foreignKey: "AgentId", as: "Agent" });
  
  BiDayOpDetail.hasMany(BiDayOpRemarks, {
    foreignKey: "Lot_Number",
    as: "BIRemarks",
  });
  BiDayOpRemarks.belongsTo(BiDayOpDetail, { foreignKey: "Lot_Number" });
  

module.exports = BiDayOpRemarks;