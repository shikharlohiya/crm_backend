// models/parivartan_employee.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('./index');
const Parivartan_Region = require('./Parivartan_Region');

// class Parivartan_BDM extends Model {}

// Parivartan_BDM.init(
//   {
//     EmployeeId: {
//       type: DataTypes.STRING(10),
//       primaryKey: true,
//     },
//     EmployeeName: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     RegionId: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       references: {
//         model: Parivartan_Region,
//         key: 'RegionId',
//       },
//     },
//     Deleted: {
//       type: DataTypes.STRING(1),
//       allowNull: false,
//       defaultValue: 'N',
//     },
//   },
//   {
//     sequelize,
//     modelName: 'parivartan_bdm',
//     tableName: 'parivartan_bdm',
//     timestamps: false,
//   }
// );

// Parivartan_BDM.belongsTo(Parivartan_Region, { foreignKey: 'RegionId' });
// Parivartan_Region.hasMany(Parivartan_BDM, { foreignKey: 'RegionId' });

// module.exports = Parivartan_BDM;
















class Parivartan_BDM extends Model {}

Parivartan_BDM.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    EmployeeId: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    EmployeeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    RegionId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: Parivartan_Region,
        key: 'RegionId',
      },
    },
    Deleted: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: 'N',
    },
  },
  {
    sequelize,
    modelName: 'parivartan_bdm',
    tableName: 'parivartan_bdm',
    timestamps: false,
  }
);

Parivartan_BDM.belongsTo(Parivartan_Region, { foreignKey: 'RegionId' });
Parivartan_Region.hasMany(Parivartan_BDM, { foreignKey: 'RegionId' });

module.exports = Parivartan_BDM;





