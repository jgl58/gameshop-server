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


exports.getGames = function(callback){
    knex.select().from('games').then(function(query){
        callback(query)
    }) 
    
}

exports.existsGame = function(id, callback){
    knex.select().from('games').where('games_id',id).then(function(query){
        callback(true)
    }).catch((error) => {
        callback(false)
    })
    
}

exports.getGameById = function(id, callback){
    knex('games').select().where('games_id',id)
    .then(function(query){
        callback(query)
    }).catch((error) => {
        callback("Error")
    });
}

exports.getGamesByCategory = function(id, callback){
    knex('games').select().where('categories_id',id)
    .then(function(query){
        callback(query)
    })
    .catch((error) => {
        callback("Error")
    });
}