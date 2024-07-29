const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index');
const Lead_Detail = require('./lead_detail');

class lead_Meeting extends Model {}

lead_Meeting.init(
  {
    // Model attributes are defined here
 

    BirdsCapacity: {
      type: DataTypes.INTEGER,
    },
    LandDimension: {
      type: DataTypes.STRING,
    },
    ShedSize: {
      type: DataTypes.STRING,
    },
    IsLandDirectionEastWest: {
      type: DataTypes.BOOLEAN,
    },
    DirectionDeviationDegree: {
      type: DataTypes.INTEGER(2),
    },
    ElectricityPower: {
      type: DataTypes.BOOLEAN,
    },
    Water: {
      type: DataTypes.BOOLEAN,
    },
    ApproachRoad: {
      type: DataTypes.BOOLEAN,
    },
    ModelType: {
      type: DataTypes.STRING,
    },
    EstimationRequirement: {
      type: DataTypes.BOOLEAN,
    },
    Image: {
      type: DataTypes.JSON,
    },
    category : {
      type: DataTypes.STRING,
    },
    sub_category :{
      type: DataTypes.STRING,
    },
    closure_month : {
      type: DataTypes.STRING,
    },
    follow_up_date :{
      type: DataTypes.STRING,
    },
    ActionType:{
      type: DataTypes.STRING,
    }
  },
  {
    sequelize,
    modelName: 'lead_Meeting',
    tableName: 'lead_meeting',
  }
);

Lead_Detail.hasMany(lead_Meeting, { foreignKey: 'LeadDetailId', as: 'lead_meetings' });
lead_Meeting.belongsTo(Lead_Detail, { foreignKey: 'LeadDetailId' });

module.exports = lead_Meeting;