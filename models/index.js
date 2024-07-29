const {Sequelize} = require('sequelize');

const sequelize = new Sequelize( 'crm_parivartan' , 'root' , 'loglin', {
 host : 'localhost',
 dialect : 'mysql'
});  

try {
    sequelize.authenticate();
    console.log('connection has been establised succesfully');
}catch(error){
    console.error('unable to connect to the data base' , error);

}

module.exports  = sequelize;