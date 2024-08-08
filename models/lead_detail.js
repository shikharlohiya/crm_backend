 


const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index');
class Lead_Detail extends Model {}
const Employee = require('./employee');
const Campaign = require('./campaign')
// const Site_visit = require('./site_visit');
// const Site_visit = require('./site_visit');

Lead_Detail.init(
    
{
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

    // Model attributes are defined here
    InquiryType: {
      type: DataTypes.STRING,
      allowNull: false,
    //   allowNull: false,
    },
    Project: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    CustomerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MobileNo: {
        type: DataTypes.STRING,
          allowNull: false,
    },
    AlternateMobileNo :{
        type: DataTypes.STRING,
        // allowNull: false,
    },
    WhatsappNo: {
        type: DataTypes.STRING,

    },
    CustomerMailId: {
        type: DataTypes.STRING,
    },
    pincode :{
        type: DataTypes.STRING,
        allowNull: false,
    },
    state_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    region_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    site_location_address : {
        type: DataTypes.STRING,
    },
    call_status : {
        type: DataTypes.STRING,
    },
    call_type : {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sub_category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    agent_remark : {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    bdm_remark : {
        type: DataTypes.STRING(1000),
    },
    follow_up_date : {
        type: DataTypes.STRING,
    },
    lead_transfer_date : {
        type: DataTypes.STRING,
    },

    source_of_lead_generated : {
        type: DataTypes.INTEGER,
    },

    close_month : {
        type: DataTypes.STRING,
    },
      
    createdAt: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'createdAt'  // Explicitly specify the field name
      },
      updatedAt: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'updatedAt'  // Explicitly specify the field name
      }
    
  },

  
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'LeadDetail', // We need to choose the model name
    tableName : 'lead_detail',
    timestamps: false,  // Disable Sequelize's automatic timestamp handling

  },
);
   
// Lead_Detail.belongsTo(Employee, { foreignKey: 'AgentId' });
// Lead_Detail.belongsTo(Employee, { foreignKey: 'BDMId' });
// Lead_Detail.belongsTo(Employee, { foreignKey: 'SuperviserID' });

Lead_Detail.belongsTo(Employee, { foreignKey: 'AgentId', as: 'Agent' });
Lead_Detail.belongsTo(Employee, { foreignKey: 'BDMId', as: 'BDM' });
Lead_Detail.belongsTo(Employee, { foreignKey: 'SuperviserID', as: 'Superviser' });
// Lead_Detail.hasMany(Site_visit, { foreignKey: 'LeadDetailId', as: 'site_visits' });
// the defined model is the class itself

Lead_Detail.belongsTo(Campaign, {
    foreignKey: 'source_of_lead_generated',
    as: 'Campaign',
  });
 
 
module.exports = Lead_Detail;
