var mysql = require('mysql');

//usado para liberar acesso ao banco
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'

function createDBConnection() {
    return mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'Joao0904*',
        database: 'payfast'
    });
}

module.exports = function () {
    return createDBConnection;
}