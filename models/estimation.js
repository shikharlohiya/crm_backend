const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index');
const Lead_Detail = require('./lead_detail');

class estimation extends Model {}

estimation.init(
  {
    // Model attributes are defined here
    EstimationRequirement: {
      type: DataTypes.STRING,
    },
    CivilConstructedStarted: {
      type: DataTypes.BOOLEAN,
    },
    ShedLength: {
      type: DataTypes.STRING,
    },
    EquipementPlacementLength: {
      type: DataTypes.STRING,
    },
    ShedWidth: {
      type: DataTypes.BOOLEAN,
    },
    CShape: {
      type: DataTypes.BOOLEAN,
    },
    ModalType: {
      type: DataTypes.STRING,
    },
    SideWallColumnToColumnGap: {
      type: DataTypes.STRING,
    },
    NumberOfSheds: {
      type: DataTypes.STRING,
    },
    CurtainRequirment: {
      type: DataTypes.BOOLEAN,
    },
    DiselBrooderRequirment: {
      type: DataTypes.BOOLEAN,
    },
    PowerSupply: {
      type: DataTypes.BOOLEAN,
    },
    WaterSupply: {
      type: DataTypes.BOOLEAN,
    },
    Remarks: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    sub_category: {
      type: DataTypes.STRING,
    },
    follow_up_date: {
      type: DataTypes.STRING,
    },
    closure_month: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Need for Approval', 'Generated', 'Estimation Shared', 'converted'),
      defaultValue: 'Pending',
      allowNull: false,
    },
    lastUpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employee_table',
        key: 'EmployeeId',
      },
    },

    estimation_amount: {
      type: DataTypes.DECIMAL(10, 2),  // Allows for up to 10 digits with 2 decimal places
      // allowNull: false,
    },
    estimationNumber: {
      type: DataTypes.STRING,
      // allowNull: false,
     
    },
    documents: {
      type: DataTypes.JSON,  // Stores an array of document objects
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'estimation',
    tableName: 'estimation',
  }
);

Lead_Detail.hasMany(estimation, { foreignKey: 'LeadDetailId', as: 'estimations' });
estimation.belongsTo(Lead_Detail, { foreignKey: 'LeadDetailId' });

module.exports = estimation;