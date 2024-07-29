// const { Sequelize, DataTypes, Model } = require('sequelize');
// const sequelize = require('./index');

// class EmployeeRole extends Model {}

// EmployeeRole.init(
//   {
//     RoleId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     RoleName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     timestamps: false,
//     modelName: 'Employee_Role',
//     tableName: 'Employee_Role'
//   }
// );

// EmployeeRole.associate = (models) => {
//   EmployeeRole.hasMany(models.Employee, {
//     foreignKey: 'EmployeeRoleID',
//     as: 'employees'
//   });
// };

// module.exports = EmployeeRole;

const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index');

class EmployeeRole extends Model {
  static associate(models) {
    EmployeeRole.hasMany(models.Employee, {
      foreignKey: 'EmployeeRoleID',
      as: 'employees'
    });
  }
}

EmployeeRole.init(
  {
    RoleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    RoleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Employee_Role',
    tableName: 'employee_role'
  }
);

module.exports = EmployeeRole;