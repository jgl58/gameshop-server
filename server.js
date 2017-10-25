//Cargamos el módulo express
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
var users = require('./users.js')
var pedidos = require('./pedidos.js')
var auth = require('./auth.js')
var comments = require('./comments.js')


//GAMES
app.get('/games', games.getGames);
app.get('/games/:id',games.getGameById);
app.get('/games/categories/:id',games.getGamesByCategory);

//COMMENTS
app.post('/games/:idGame/comments',auth.loginWithBody,comments.createComment)
app.put('/games/:idGame/comments/:idComment',auth.loginWithBody,comments.updateComment)
app.delete('/games/:idGame/comments/:idComment',auth.loginWithBody,comments.deleteComment)

//LOGIN
app.post('/login',auth.loguear);
app.post('/register',users.createUser);

//USERS
app.put('/users/:id',users.updateUser)
app.get('/users/:id',users.getUser)

//PEDIDOS
app.post('/games/:idGame/orders',auth.loginWithBody,pedidos.createPedido)
app.get('/users/:id/orders',auth.login,pedidos.getPedidos)
app.put('/users/:id/orders/:idOrder/pay',auth.login,pedidos.pagarPedido)
app.delete('/users/:id/orders/:idOrder',auth.login,pedidos.deletePedido)

//Este método delega en el server.listen "nativo" de Node
   
app.listen(process.env.PORT || 3000, function () {
    
    knex.schema.createTableIfNotExists('categories', function (table) {
        table.increments('categories_id');
        table.string('type');
    }).then(function () {
       // console.log('Categories Table is Created!');  
    })
    
    
    knex.schema.createTableIfNotExists('users', function (table) {
        table.increments('users_id');
        table.string('nick');
        table.integer('pass');
        table.string('name');
        table.string('lastname');
    }).then(function () {
       // console.log('Users Table is Created!');
        
    });

    knex.schema.createTableIfNotExists('games', function (table) {
        table.increments('games_id');
        table.string('title');
        table.integer('year');
        table.integer('price');
        table.integer('categories_id');
        table.foreign('categories_id').references('categories.categories_id');
        table.integer('valoration');
        
    }).then(function () {
      //  console.log('Games Table is Created!');
    });

    knex.schema.createTableIfNotExists('comments',function(table){
        table.increments('comments_id');
        table.string('message')
        table.integer('user_id');
        table.foreign('user_id').references('users.users_id');
        table.integer('game_id');
        table.foreign('game_id').references('games.games_id');
    }).then(function(){
     //   console.log('Comments Table is Created!');
    })


    knex.schema.createTableIfNotExists('orders',function(table){
        table.increments('orders_id');
        table.integer('game_id');
        table.foreign('game_id').references('games.games_id');
        table.timestamp('created_at');
        table.integer('processed');
        table.integer('user_id');
        table.foreign('user_id').references('users.users_id');
    }).then(function(){
      //  console.log('Orders Table is Created!');
    })


    knex('categories').count('categories_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Categorias insertadas");
            return knex('categories').insert([
                {type: "Deportes"},
                {type: "Guerra"},
                {type: "Aventuras"},
                {type: "Carreras"}
            ])
        }
    })
    knex('users').count('users_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Usuarios insertadas");
            return knex('users').insert([
                {users_id: 1, nick: "jonay", pass: "pass", name: "name", lastname: "lastname"}
            ])
        }
    })

    knex('games').count('games_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Juegos insertados");
            return knex('games').insert([
                {games_id:1, title:"FIFA 18", year:2017, price: 65, categories_id: 1},
                {games_id:2, title:"NBA 2K18", year:2017, price: 45, categories_id: 1},
                {games_id:3, title:"Call Of Duty: WWII", year:2017, price: 80, categories_id: 2},
                {games_id:4, title:"Counter Strike: Global Ofensive", year:2012, price: 15, categories_id: 2},
                {games_id:5, title:"The Legend Of Zelda: Breath Of The Wild", year:2017, price: 40, categories_id: 3}
            ]) 
        }
    })
    


   console.log("El servidor express está en el puerto 3000");
  
   
});