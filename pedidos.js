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

exports.getPedidos = function(id,callback){
  
    knex('orders').select('orders_id','games.*').where('user_id',id).join('games','game_id','games_id').then(function(query){
        callback(query)
    })
}

exports.sumPedido = function(id,callback){
    knex('orders').sum('price').where('user_id',id)
    .join('linorders','linea_id','linorders_id')
    .join('games','game_id','games_id').then(function(query){
            callback(query)
    })
}

exports.createPedido = function(idGame, idUser, idPedido, callback){
    knex('orders').insert({
        game_id: idGame,
        user_id: idUser,
        orders_id: idPedido,
        processed: 0
    }).then(function(){
        callback(201)
        
    }).catch(function(error){
        callback(400)
    })
}

exports.pagarPedido = function(id){
    knex('orders')
    .update({
      processed: 'true'
    }).where('orders_id', id)
}
