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

var games = require('./games.js')

exports.getPedidos = function(pet,res){
    var id = parseInt(pet.params.id)
    var token = pet.headers.token;
    console.log("Token: "+token)
    var secret = '123456'
    if(isNaN(id)){
        res.status(401).send({userMessage: "La id del usuario tiene que ser numerica", devMessage: ""})
    }else{
        knex('orders').select('orders_id','processed','games.*').where('user_id',id).join('games','game_id','games_id').then(function(data){
            res.status(200).send(data)
        })
    }      
}

exports.createPedido = function(req,res){
    var token = req.body.token;
    console.log("Token: "+token)
    var secret = '123456'
    var idGame = req.params.idGame;
    var cookies = jwt.decode(token, secret);
        
    games.existsGame(idGame, function(existe){
        if(existe == true){       
            knex('orders').insert({
                game_id: idGame,
                user_id: cookies.idUser,
                processed: 0
            }).then(function(idPedido){
                res.status(201).send({
                    _links: {
                        lista_pedidos: "/users/"+cookies.idUser+"/listaPedidos",
                        _self: "/pedidos/"+idPedido
                    }
                    });
                
            }).catch(function(error){
                res.status(400).send({userMessage: "Juego ya añadido", devMessage: ""})
            })          

        }else{
            res.status(404).send({userMessage: "El juego no existe", devMessage:""})
        }
    }) 
}

exports.pagarPedido = function(req, res){
    var id = parseInt(req.params.id)
    var idPed = parseInt(req.params.idOrder)
        
    if(isNaN(id) && isNaN(idPed)){
        res.status(401).send({userMessage: "Las ids del usuario y del pedido tienen que ser numericas", devMessage: ""})
    }else{             
        knex('orders')
        .where('orders_id', idPed)
        .update({processed: 1})
        .then(function(count){
            console.log(count)
            res.status(204)
        }).catch(function(err){
            console.log("Error al actualizar")
        });      
    }
    
}

exports.deletePedido = function(req, res){
    var id = parseInt(req.params.id)
    var idPed = parseInt(req.params.idOrder)
        
    if(isNaN(id) && isNaN(idPed)){
        res.status(401).send({userMessage: "Las ids del usuario y del pedido tienen que ser numericas", devMessage: ""})
    }else{             
        knex('orders')
        .where('orders_id', idPed)
        .del()
        .then(function(count){
            console.log(count)
            res.status(204)
        }).catch(function(err){
            console.log("Error al borrar")
        });      
    }
}