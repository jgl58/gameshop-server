var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var bp = require('body-parser');
var jwt = require('jwt-simple');
var moment = require('moment');
var uuid = require('uuid/v4')
var app = express();
var secret = '123456'

app.use(bp.json());
app.use(bp.urlencoded({
    extended: true
}));
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    }
});
var db = require('./db.js');
var carrito = new Array();


exports.getUserByNick = function(nick, callback){
   
    knex('users').where('nick',nick).first().then(function(query){
        callback(query)
    }).catch((error) => {
        callback("Error")
    });
       
}

exports.existsUser = function(nick, callback){
    knex('users').count('users_id as c').where('nick',nick).then(function(total){
        if(total[0].c == 1){
            callback(true)
        }else{
            callback(false)
        }
    })
}

exports.insertUser = function(data, callback){
    knex('users').insert([
        {nick: data.nick, pass: data.pass, name: "Name", lastname: "Lastname"}
    ]).then(function(f){
        knex('users').where('nick',data.nick).first().then(function(query){
            callback(query)
        })
    }) 
}

exports.createUser = function(req,res){
    var nick = req.body.nickname;
    var pass = req.body.password;

    users.existsUser(nick, function(exists){
        console.log(exists)
        if(!exists){
            console.log("Usuario insertado");
            var data = {
                nick: nick,
                pass: pass
            }
            users.insertUser(data, function(user){
                res.send(user)
            })
            
        }else{
            console.log("Ese usuario ya existe");
            res.status(401).send({userMessage: "Usuario existente, prueba con otro nick", devMessage: ""})
        }
    }) 
}

