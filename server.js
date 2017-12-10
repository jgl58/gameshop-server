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
var cors = require('cors');
app.use(cors());
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
var games = require('./games.js')
var users = require('./users.js')
var pedidos = require('./pedidos.js')
var auth = require('./auth.js')
var comments = require('./comments.js')

module.exports = app;

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

//GOOGLE
app.use('/login/google',express.static('web'))
app.get('/static',function(req,res){
    res.send(200)
})

//USERS
app.put('/users/:id',auth.loginUsers,users.updateUser)
app.get('/users/:id',auth.login,users.getUser)

//PEDIDOS
app.post('/games/:idGame/orders',auth.loginWithBody,pedidos.createPedido)
app.get('/users/:id/orders',auth.login,pedidos.getPedidos)
app.get('/users/:id/orders/:idOrder',auth.login,pedidos.getPedido)
app.put('/users/:id/orders/:idOrder',auth.loginUsers,pedidos.pagarPedido)
app.delete('/users/:id/orders/:idOrder',auth.loginUsers,pedidos.deletePedido)

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
        table.string('url');
        table.integer('categories_id');
        table.foreign('categories_id').references('categories.categories_id');
        
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
            console.log("Usuarios insertados");
            return knex('users').insert([
                {users_id: 1, nick: "jonay", pass: "pass", name: "name", lastname: "lastname"}
            ])
        }
    })

    knex('games').count('games_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Juegos insertados");
            return knex('games').insert([
                {games_id:1, title:"FIFA 18", year:2017, price: 65, categories_id: 1, url: "https://cdn02.nintendo-europe.com/media/images/11_square_images/games_18/nintendo_switch_5/SQ_NSwitch_EASportsFifa18.jpg"},
                {games_id:2, title:"NBA 2K18", year:2017, price: 45, categories_id: 1, url: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5880/5880000_sd.jpg;maxHeight=550;maxWidth=642"},
                {games_id:3, title:"Call Of Duty: WWII", year:2017, price: 80, categories_id: 2, url: "http://cahosgaming.com.ar/uploads/b/13B20170426_1493251330_COD%20-%20WW2.jpg"},
                {games_id:4, title:"Counter Strike: Global Ofensive", year:2012, price: 15, categories_id: 2, url: "https://i11b.3djuegos.com/juegos/7909/counterstrike_global_offensive/fotos/ficha/counterstrike_global_offensive-1942557.jpg"},
                {games_id:5, title:"The Legend Of Zelda: Breath Of The Wild", year:2017, price: 40, categories_id: 3, url: "https://cdn4.areajugones.es/wp-content/uploads/2017/01/zelda-breath-of-the-wild-europa.jpeg"}
            ]) 
        }
    })
    


   console.log("El servidor express está en el puerto 3000");
  
   
});