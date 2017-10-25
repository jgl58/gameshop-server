var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');

var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    }
});


exports.getUserByNick = function(nick,callback){
    knex('users').where('nick',nick).first().then(function(query){
        callback(query)
    }).catch((error) => {
        callback("Error")
    });
}