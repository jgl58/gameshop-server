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
    },
    useNullAsDefault: true
});


exports.getUserByNick = function(nick, callback){
   
    knex('users').where('nick',nick).first().then(function(query){
        callback(query)
    }).catch((error) => {
        callback("Error")
    });
       
}

exports.getUser = function(pet, res){
    var id = pet.params.id
     knex('users').where('users_id',id).first().then(function(query){
         res.status(200).send({
             "profile": query,
             "links": {
                "updateUser": "/users/"+id,
                "deleteUser": "/users/"+id,
                "orders": "/users/"+id+"/orders"
             }
         })
     }).catch((error) => {
         res.status(404).send({userMessage: "Usuario no existente", devMessage: ""})
     });
        
 }

 exports.deleteUser = function(req, res){
    var id = parseInt(req.params.id)
        
    if(isNaN(id)){
        res.status(401).send({userMessage: "Las id del usuario tiene que ser numerica", devMessage: ""})
    }else{             
        knex('users')
        .where('users_id', id)
        .del()
        .then(function(count){
            //console.log(count)
            res.status(204)
        }).catch(function(err){
            //console.log("Error al borrar")
            es.status(404).send({userMessage: "Usuario no existente", devMessage: ""})
        });      
    }
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

function existe(nick, callback){
    knex('users').count('users_id as c').where('nick',nick).then(function(total){
        
        if(total[0].c == 1){
            callback(true)
        }else{
            callback(false)
        }
    })
}
exports.createUser = function(req,res){
    var nick = req.body.nick;
    var pass = req.body.pass;

    existe(nick, function(exists){
        //console.log(exists)
        if(!exists){
            var data = {
                nick: nick,
                pass: pass
            }
            knex('users').insert([
                {nick: data.nick, pass: data.pass, name: "Name", lastname: "Lastname"}
            ]).then(function(f){
                knex('users').where('nick',data.nick).first().then(function(query){
                    res.setHeader('Location','/users/'+query.users_id);
                    res.status(201);
                })
            }) 
        }else{
            res.status(401).send({userMessage: "Usuario existente, prueba con otro nick", devMessage: ""})
        }
    }) 
}

exports.updateUser = function(req, res){
    var id = parseInt(req.params.id)
    var data = req.body.newData
    console.log(data)
    if(isNaN(id)){
        res.status(401).send({userMessage: "Las id del usuario tiene que ser numerica", devMessage: ""})
    }else{             
        knex('users')
        .where('users_id', id)
        .update({nick: data.nick, pass: data.pass, name: data.name, lastname: data.lastname})
        .then(function(count){
            //console.log(count)
            res.status(204)
        }).catch(function(err){
            //console.log("Error el usuario no existe")
            res.status(404).send({userMessage: "Usuario no existente", devMessage: ""})
        });      
    }
    
}

exports.correctLog = function(nick,pass,callback){
    knex('users').where('nick',nick).where('pass',pass)
    .count('users_id as c').then(function(total){
        if(total[0].c == 1){
            callback(true)
        }else{
            callback(false)
        }
    })
}